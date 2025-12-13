const User = require('../../models/user.model');
const Task = require('../../models/tasks.model');
const {sendMessage} = require("../utils/sendMessage")
const {deleteLastMessage} = require('../utils/deleteLastMessage')
const {selectButton} = require('../keyboards/keyboard')
const {findButton} = require('../utils/buttonController')
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const PASS_THRESHOLD = 0.8;

class TestSystem {
	
	async startTest(ctx) {
		try {
			const chat_id = ctx?.message?.chat?.id || ctx.update?.callback_query?.message?.chat?.id

			await User.updateOne(
				{ chat_id },
				{
					$set: {
						test_progress: {
							current_level: 'A1',
							current_question: 0,
							answers: {},
							completed_levels: []
						}
					}
				}
			);
			
			await this.showNextQuestion(ctx);
			
		} catch (e) {
			console.error('Помилка запуску тесту:', e);
			await sendMessage({ctx, message: 'Виникла помилка при запуску тесту. Спробуйте пізніше.', save: true})
			
		}
	}
	
	async showNextQuestion(ctx) {
		try {
			const chat_id = ctx?.message?.chat?.id || ctx.update?.callback_query?.message?.chat?.id
			
			await deleteLastMessage(ctx)
			
			const user = await User.findOne({ chat_id });
			
			if (!user || !user.test_progress) {
				await sendMessage({ctx, message:"Помилка: тест не ініціалізовано", save: true})
				return;
			}
			
			const { current_level, current_question } = user.test_progress;
			
			const questions = await Task.find({type: current_level})
				.sort({ question_position: 1 })
				.lean();

			if (!questions || questions.length === 0) {
				await this.finishLevel(ctx);
				return;
			}
			
			if (current_question >= questions.length) {
				await this.finishLevel(ctx);
				return;
			}
			
			const question = questions[current_question];
			let messageText = await findButton(['task_template_message'])
			messageText = messageText[0].replace(/{{level}}/g, current_level).replace(/{{current_number_task}}/g, current_question + 1).replace(/{{amount_task}}/g, questions.length).replace(/{{question}}/g, question.question);
			
			const buttons = [];
			
			question.answers.forEach((answer, index) => {
				messageText += `\n${index + 1}. ${answer}`;
				
				if (index % 2 === 0) {
					buttons.push([]);
				}
				
				buttons[buttons.length - 1].push({
					text: `${index + 1}`,
					callback_data: `answer_${question._id}_${index}`
				});
			});
			
			buttons.push(await selectButton('end_test'));
			
			await sendMessage({
				ctx,
				image: question.image,
				video: question.video,
				audio: question.audio,
				message: messageText,
				button: { inline_keyboard: buttons },
				save: true
			});
			
		} catch (e) {
			console.error('Помилка показу питання:', e);
			await sendMessage({ctx, message: 'Виникла помилка. Спробуйте ще раз.'})
		}
	}
	
	async handleAnswer(ctx, questionId, answerIndex) {
		try {
			const chat_id = ctx?.message?.chat?.id || ctx.update?.callback_query?.message?.chat?.id
			
			await ctx.answerCbQuery();
			const user = await User.findOne({ chat_id });
			const question = await Task.findById(questionId);
			
			if (!user || !question) {
				await ctx.answerCbQuery('Помилка обробки відповіді');
				return;
			}
			
			if (question.type !== user.test_progress.current_level) {
				await ctx.answerCbQuery('Це питання з іншого рівня');
				return;
			}
			
			const isCorrect = question.correct_answer === answerIndex;
			
			const answers = user.test_progress.answers || {};
			
			if (answers[questionId]) {
				await ctx.answerCbQuery('Ви вже відповіли на це питання');
				return;
			}
			
			answers[questionId] = {
				answer: answerIndex,
				correct: isCorrect,
				level: question.type
			};
			
			await User.updateOne(
				{ chat_id },
				{
					$set: {
						'test_progress.answers': answers,
						'test_progress.current_question': user.test_progress.current_question + 1
					}
				}
			);
			
			const canPass = await this.canStillPass(chat_id, question.type);
			
			if (!canPass) {
				await this.finishLevel(ctx);
			} else {
				await this.showNextQuestion(ctx);
			}
			
		} catch (e) {
			console.error('Помилка обробки відповіді:', e);
			await ctx.answerCbQuery('Виникла помилка');
		}
	}

	async passEmptyLevel(ctx, level) {
		const chat_id = ctx?.message?.chat?.id || ctx.update?.callback_query?.message?.chat?.id;

		const currentLevelIndex = LEVELS.indexOf(level);
		const nextLevel = LEVELS[currentLevelIndex + 1];

		if (!nextLevel) {
			const finishTesk = await findButton(['result_finish_template_message']);
			const messageText = finishTesk[0].replace(/{{current_level}}/g, level);

			await sendMessage({ ctx, message: messageText, save: false });

			await User.updateOne(
				{ chat_id },
				{
					$set: { final_level: level, test_completed: true },
					$unset: { test_progress: '' }
				}
			);

			return;
		}

		const nextLevelQuestions = await Task.countDocuments({ type: nextLevel });

		if (nextLevelQuestions === 0) {
			const finishTesk = await findButton(['result_finish_template_message']);
			const messageText = finishTesk[0].replace(/{{current_level}}/g, level);

			await sendMessage({ ctx, message: messageText, save: false });

			await User.updateOne(
				{ chat_id },
				{
					$set: { final_level: level, test_completed: true },
					$unset: { test_progress: '' }
				}
			);

			return;
		}

		await User.updateOne(
			{ chat_id },
			{
				$set: {
					'test_progress.current_level': nextLevel,
					'test_progress.current_question': 0
				}
			}
		);

		await this.showNextQuestion(ctx);
	}
	
	async canStillPass(chat_id, level) {
		try {
			const user = await User.findOne({ chat_id });
			const totalQuestions = await Task.countDocuments({ type: level });
			
			if (!user || !user.test_progress) return false;
			
			let answers = {};
			if (user.test_progress.answers) {
				if (user.test_progress.answers instanceof Map) {
					answers = Object.fromEntries(user.test_progress.answers);
				} else {
					answers = user.test_progress.answers;
				}
			}
			
			let correctCount = 0;
			let answeredCount = 0;
			
			Object.values(answers).forEach(ans => {
				if (ans && ans.level === level) {
					answeredCount++;
					if (ans.correct) correctCount++;
				}
			});
			
			const remainingQuestions = totalQuestions - answeredCount;
			const maxPossibleCorrect = correctCount + remainingQuestions;
			const maxPossiblePercentage = maxPossibleCorrect / totalQuestions;
			
			return maxPossiblePercentage >= PASS_THRESHOLD;
			
		} catch (e) {
			console.error('Помилка перевірки можливості проходження:', e);
			return true;
		}
	}

	async finishLevel(ctx) {
		try {
			const chat_id = ctx?.message?.chat?.id || ctx.update?.callback_query?.message?.chat?.id;
			const user = await User.findOne({ chat_id });

			if (!user || !user.test_progress) return;

			const { current_level } = user.test_progress;

			await deleteLastMessage(ctx);

			let answers = {};
			if (user.test_progress.answers) {
				if (user.test_progress.answers instanceof Map) {
					answers = Object.fromEntries(user.test_progress.answers);
				} else {
					answers = user.test_progress.answers;
				}
			}

			const levelAnswers = Object.values(answers).filter(ans => ans && ans.level === current_level);
			const totalQuestions = await Task.countDocuments({ type: current_level });

			// ✅ Якщо питань немає — автоматично проходимо рівень
			if (totalQuestions === 0) {
				await this.passEmptyLevel(ctx, current_level);
				return;
			}

			const correctCount = levelAnswers.filter(ans => ans.correct).length;
			const percentage = correctCount / totalQuestions;

			const passed = percentage >= PASS_THRESHOLD;
			const borderline = percentage >= 0.65 && percentage < PASS_THRESHOLD;

			let messageText = await findButton(['result_template_message']);
			messageText = messageText[0].replace(/{{correct_answer}}/g, correctCount);

// ✅ 1) Якщо ≥ 80% — рівень пройдено
			if (passed) {
				const currentLevelIndex = LEVELS.indexOf(current_level);
				const nextLevel = LEVELS[currentLevelIndex + 1];

				if (nextLevel) {
					const nextLevelQuestions = await Task.countDocuments({ type: nextLevel });

					if (nextLevelQuestions === 0) {
						const finishTesk = await findButton(['result_finish_template_message']);
						const msg = finishTesk[0].replace(/{{current_level}}/g, current_level);

						await sendMessage({ ctx, message: msg, save: false });

						await User.updateOne(
							{ chat_id },
							{
								$set: { final_level: current_level, test_completed: true },
								$unset: { test_progress: '' }
							}
						);
						return;
					}

					await User.updateOne(
						{ chat_id },
						{
							$set: {
								'test_progress.current_level': nextLevel,
								'test_progress.current_question': 0
							}
						}
					);

					await this.showNextQuestion(ctx);
					return;
				}

				const finishTesk = await findButton(['result_finish_template_message']);
				const msg = finishTesk[0].replace(/{{current_level}}/g, current_level);

				await sendMessage({ ctx, message: msg, save: false });

				await User.updateOne(
					{ chat_id },
					{
						$set: { final_level: current_level, test_completed: true },
						$unset: { test_progress: '' }
					}
				);
				return;
			}

// ✅ 2) Якщо 65–70% — “майже пройшов”
			if (borderline) {
				const currentLevelIndex = LEVELS.indexOf(current_level);
				const nextLevel = LEVELS[currentLevelIndex + 1];

				const findRecCourse = await Task.findOne({ type: current_level }).populate('recommended_course_id');

				let buttons = [];

				if (findRecCourse?.recommended_course_id?._id) {
					buttons.push([
						{
							text: `Покращити ${current_level}`,
							callback_data: `goto_${findRecCourse.recommended_course_id._id}`
						}
					]);
				}

				const findNextRecCourse = await Task.findOne({ type: current_level === 'A1' ? 'A2' : current_level === 'A1' ? 'B1' : current_level === 'B2' ? 'C1' : current_level === 'C1' ? 'C2' : 'C2' }).populate('recommended_course_id');

				if (findNextRecCourse && nextLevel) {

					const button = await findButton(['result_course_button'])
					let button_link = button[0].replace(/{{course_title}}/g, nextLevel)

					buttons.push([
						{
							text: button_link,
							callback_data: `goto_${findNextRecCourse.recommended_course_id._id}`
						}
					]);
				}

				const correctCount = levelAnswers.filter(ans => ans.correct).length;
				let borderlineMsg = await findButton(['result_borderline_template_message']);
				borderlineMsg = borderlineMsg[0]
					.replace(/{{current_level}}/g, current_level)
					.replace(/{{next_level}}/g, nextLevel || current_level)
					.replace(/{{correct_answer}}/g, correctCount);

				await sendMessage({
					ctx,
					message: borderlineMsg,
					button: { inline_keyboard: buttons }
				});

				await User.updateOne(
					{ chat_id },
					{
						$set: {
							final_level: current_level,
							test_completed: true
						},
						$unset: { test_progress: '' }
					}
				);

				return;
			}

			const currentLevelIndex = LEVELS.indexOf(current_level);
			const finalLevel = currentLevelIndex > 0 ? LEVELS[currentLevelIndex - 1] : 'A1';

			const findRecCourse = await Task.findOne({ type: current_level }).populate('recommended_course_id');

			let button = [];
			if (findRecCourse?.recommended_course_id?._id) {
				button = await selectButton(
					'result_course',
					findRecCourse.recommended_course_id.title,
					findRecCourse.recommended_course_id._id
				);
			}

			let finishTest = await findButton(['result_level_template_message']);
			messageText += finishTest[0].replace(/{{current_level}}/g, finalLevel);

			await sendMessage({ ctx, message: messageText, button });

			await User.updateOne(
				{ chat_id },
				{
					$set: {
						final_level: finalLevel,
						test_completed: true
					},
					$unset: { test_progress: '' }
				}
			);

		} catch (e) {
			console.error('Помилка завершення рівня:', e);
			await sendMessage({ ctx, message: 'Виникла помилка при обробці результатів', save: true });
		}
	}
}
module.exports = new TestSystem();