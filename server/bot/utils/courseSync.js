const Courses = require('../../models/courses.model');
const Categories = require('../../models/category.model');
const {findButton} = require('./buttonController')

async function getCourse({ title, id }) {
	try {
		
		const or = [];
		if (title) or.push({ title });
		if (id) or.push({ _id: id });
		
		const category = await Categories.findOne(
			{ $or: or }
		).lean();
		
		if (category) {
			const course = await Courses.find({
				categoryId: category?._id
			});
			
			const buttons = [];
			
			course.forEach((item, index) => {
				
				if (index % 2 === 0) {
					buttons.push([]);
				}
				
				buttons[buttons.length - 1].push({
					text: `${item?.title}`
				});
			});
			
			const button = await findButton(['back_button','back_to_home_button'])
			
			return {...category,
				button:{
					keyboard: [
						...buttons,
						[
							{
								text: button[0]
							},
							{
								text: button[1]
							},
						],
					],
					resize_keyboard: true,
				}};
		}
		
	} catch (e) {
		console.error(e);
		return { message: "Виникла невідома помилка" };
	}
};

async function getOptionCourse({ categoryId, title, selected = '', id = '' }) {
	try {
		
		const or = [];
		if (title) or.push({ title });
		if (id) or.push({ _id: id });
		
		const course = await Courses.findOne({
			categoryId,
			...(or.length > 0 && { $or: or })
		}).lean();

		if(course){
			const buttons = [];
			
			let mainMessage = {}
			let mainOption = 0
			course?.option.forEach((item, index) => {
				
				if(item?.main && !selected){
					mainMessage = {...item}
					mainOption++
				}
				else if(item?.title === selected){
					mainMessage = {...item}
					mainOption++
				}
				else {
					if ((mainOption-index) % 2 === 0) {
						buttons.push([]);
					}
					
					buttons[buttons.length - 1].push({
						text: `${item?.title}`
					});
				}
			});
			
			const button = await findButton(['back_button','back_to_home_button', 'buy_button'])
			
			return {...mainMessage,
				_id: course?._id,
				button:{
					keyboard: [
						...buttons,
						[{
							text: button[2]
						}],
						[
							{
								text: button[0]
							},
							{
								text: button[1]
							},
						],
					],
					resize_keyboard: true,
				}};
		}
	} catch (e) {
		console.error(e)
		return { message: "Виникла невідома помилка" };
	}
};

async function findCourseDetail(_id){
	try{
		const res = await Courses
			.findOne({ _id })
			.populate("categoryId");
		
		return res
	} catch (e) {
		console.error()
	}
}

module.exports = {getCourse, getOptionCourse, findCourseDetail}