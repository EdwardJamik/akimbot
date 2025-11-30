const Courses = require('../../models/courses.model');
const { findControllerTextButton, findTextButton } = require('../utils/buttonController');
const {checkedUser, getUserData, setUserAction} = require('../utils/userSync');
const { selectButton } = require('../keyboards/keyboard');
const { sendMessage } = require('../utils/sendMessage');
const TestSystem = require('../testSystem/testSystem');
const {deleteLastMessage, saveLastMessage} = require('../utils/deleteLastMessage')
const {getCourse, getOptionCourse, findCourseDetail} = require('../utils/courseSync')
const {handleBack} = require('../utils/handleBack')

module.exports = async bot => {
    
    bot.start(async (ctx) => {
        await deleteLastMessage(ctx, true)
        const button = await selectButton('start_bot');
        const message = await findTextButton('start_message');
        
        await checkedUser(ctx.message.chat);
        await sendMessage({ctx, ...message, button, save: false})
    });
    
    bot.on('callback_query', async (ctx) => {
        await deleteLastMessage(ctx, true)
        const data = ctx.callbackQuery.data;
        const chat_id = ctx.callbackQuery.message.chat.id;
        const {action} = await getUserData({chat_id})
        const actionOption = action.split("_");
        
        if (data.startsWith('answer_')) {
            const parts = data.split('_');
            const questionId = parts[1];
            const answerIndex = parseInt(parts[2]);
            
            await TestSystem.handleAnswer(ctx, questionId, answerIndex);
        } else if (data === 'start_test') {
            await ctx.answerCbQuery();
            await deleteLastMessage(ctx)
            await TestSystem.startTest(ctx);
        } else if (data === 'end_test') {
            await ctx.answerCbQuery();
            await deleteLastMessage(ctx)
            await TestSystem.finishLevel(ctx);
        } else if(data === 'back_course_button'){
            const course = await getOptionCourse({categoryId: actionOption[1], id: actionOption[2]})
            await sendMessage({
                ctx,
                image: course?.image,
                video: course?.video,
                message: course?.message,
                button: course?.button,
                save: true
            })
            await setUserAction({chat_id, action: `${actionOption[0]}_${actionOption[1]}_${course?._id}`})
        } else if(data.startsWith('goto_')){
            const parts = data.split('_');
            const course = await getCourse({id: parts[1]})
            
            await sendMessage({
                ctx,
                image: course?.image,
                video: course?.video,
                audio: course?.audio,
                message: course?.message,
                button: course?.button,
                save: true
            })
            await setUserAction({chat_id, action: `courses_${parts[1]}`})
        }
        
        return false;
        
    });
    
    bot.on('text', async (ctx) => {
        const message = ctx.message.text;
        const command = await findControllerTextButton(message);
        const chat_id = ctx.message.chat.id;
        const {action} = await getUserData({chat_id})
        const actionOption = action.split("_");
        
        if (command && command !== 'back_button') {
            switch (command) {
                case 'courses_button': {
                    const message = await findTextButton('courses_message');
                    const button = await selectButton('courses_list');
                    await setUserAction({chat_id, action: 'courses'})
                    await sendMessage({ctx, ...message, button, save: true})
                }
                    break;
                
                case 'back_to_home_button': {
                    const button = await selectButton('start_bot');
                    const message = await findTextButton('start_message');
                    
                    await setUserAction({chat_id, action: ''})
                    await checkedUser(ctx?.message?.chat);
                    await sendMessage({ctx, ...message, button, save: false})
                }
                    break;
                
                case 'faq_button': {
                    const message = await findTextButton('faq_message');
                    await sendMessage({ctx, ...message, save: true});
                }
                    break;
                
                case 'getmylevel_button': {
                    const message = await findTextButton('getmylevel_message');
                    const button = await selectButton('start_test');
                    await sendMessage({ctx, ...message, button, save: true})
                }
                    break;
                
                case 'courses_button': {
                    const message = await findTextButton('courses_message');
                    await sendMessage({ctx, ...message, save: true});
                }
                    break;
                
                case 'report_button': {
                    const message = await findTextButton('report_message');
                    await sendMessage({ctx, ...message, save: true});
                }
                    break;
                case 'buy_button': {
                    
                    let message = await findTextButton('buy_message');
                    
                    const findAmountCourse = await findCourseDetail(actionOption[2])
                    message.message = message.message
                      .replace(/{{title}}/g, findAmountCourse?.categoryId?.title)
                      .replace(/{{description}}/g, findAmountCourse?.title)
                      .replace(/{{price}}/g, findAmountCourse?.price);
                    const button = await selectButton('buy_courses',findAmountCourse, chat_id);
                    
                    await sendMessage({ctx, ...message, button, save: true});
                }
                    break;
                    // createPaymentLink
                default:
                    // const user = await User.findOne({chat_id});
                    // if (user && user.test_progress) {
                        await ctx.reply('Будь ласка обреіть пункт меню або введіть команду /start');
                    // }
                    break;
            }
        }
        else {
            const {action} = await getUserData({chat_id})
            const actionOption = action.split("_");
            
            if (command !== 'back_button') {
                if (actionOption.length === 1 && actionOption[0] === 'courses') {
                    const course = await getCourse({title: message})
                    
                    await sendMessage({
                        ctx,
                        image: course?.image,
                        video: course?.video,
                        audio: course?.audio,
                        message: course?.message,
                        button: course?.button,
                        save: true
                    })
                    await setUserAction({chat_id, action: `courses_${course?._id}`})
                } else if (actionOption.length === 2 && actionOption[1]) {
                    const course = await getOptionCourse({categoryId: actionOption[1], title: message})
                    await sendMessage({
                        ctx,
                        image: course?.image,
                        video: course?.video,
                        audio: course?.audio,
                        message: course?.message,
                        button: course?.button,
                        save: true
                    })
                    await setUserAction({chat_id, action: `${actionOption[0]}_${actionOption[1]}_${course?._id}`})
                } else if (actionOption.length === 3 && actionOption[2]) {
                    const course = await getOptionCourse({
                        categoryId: actionOption[1],
                        id: actionOption[2],
                        selected: message
                    })
                    await sendMessage({
                        ctx,
                        image: course?.image,
                        video: course?.video,
                        audio: course?.audio,
                        message: course?.message,
                        button: course?.button,
                        save: true
                    })
                    await setUserAction({chat_id, action: `${actionOption[0]}_${actionOption[1]}_${course?._id}`})
                }
            } else {
                if (actionOption.length === 2 && actionOption[1] && !actionOption[2]) {
                    const message = await findTextButton('courses_message');
                    const button = await selectButton('courses_list');
                    await setUserAction({chat_id, action: 'courses'})
                    await sendMessage({ctx, ...message, button, save: true})
                }
                else if (actionOption.length === 3 && actionOption[2] && !actionOption[3]) {
                    
                    const course = await getCourse({title: false, id: actionOption[1]})
                    
                    await sendMessage({
                        ctx,
                        image: course?.image,
                        video: course?.video,
                        audio: course?.audio,
                        message: course?.message,
                        button: course?.button,
                        save: true
                    })
                    await setUserAction({chat_id, action: `courses_${course?._id}`})
                    
                }  else if (actionOption.length === 4 && actionOption[3] === 'buy') {
                    const course = await getOptionCourse({categoryId: actionOption[1], id: actionOption[2]})
                    await sendMessage({
                        ctx,
                        image: course?.image,
                        video: course?.video,
                        message: course?.message,
                        button: course?.button,
                        save: true
                    })
                    await setUserAction({chat_id, action: `${actionOption[0]}_${actionOption[1]}_${course?._id}`})
                }
                else {
                    const button = await selectButton('start_bot');
                    const message = await findTextButton('start_message');
                    
                    await setUserAction({chat_id, action: ''})
                    await checkedUser(ctx?.message?.chat);
                    await sendMessage({ctx, ...message, button, save: false})
                }
                
            }
        }
        await deleteLastMessage(ctx, true)
    });
};