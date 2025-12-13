const MessagesTemplate = require('../../models/messages.model');
const Course = require('../../models/courses.model');
const Category = require('../../models/category.model');
const {findButton} = require('../utils/buttonController')
const {findCourseDetail} = require('../utils/courseSync')
const {createPaymentLink} = require('../utils/createPaymentLink')
class botButtons{
  
  async selectButton(command, course_array, chat_id){
    try{
      switch (command)
      {
        case 'start_bot': {
          const button = await findButton(['courses_button','faq_button','getmylevel_button','report_button'])
          
          return {
            keyboard: [
              [
                {
                  text: button[0]
                },
                {
                  text: button[1]
                }
              ],
              [
                {
                  text: button[2]
                }
              ],
              [
                {
                  text: button[3]
                }
              ]
            ],
            resize_keyboard: true,
          }
        }
          break
        
        case 'courses_list': {
          const button = await findButton(['back_button'])
          
          const categoryCourses = await Category.aggregate([
            { $match: { active: true } },
            {
              $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "categoryId",
                as: "courses"
              }
            },
            {
              $match: {
                "courses.option.0": { $exists: true }
              }
            },
            {
              $project: {
                _id: 1,
                title: 1,
                order: 1
              }
            },
            { $sort: { order: 1 } }
          ]);
          
          const categoryButton = [];
          
          categoryCourses.forEach((categories, index) => {
            
            if (index % 2 === 0) {
              categoryButton.push([]);
            }
            
            categoryButton[categoryButton.length - 1].push({
              text: `${categories?.title}`,
            });
          });
          
          return {
            keyboard: [
              ...categoryButton,
              [
                {
                  text: button[0]
                },
              ],
            ],
            resize_keyboard: true,
          }
        }
          break
        case 'start_test': {
          const button = await findButton(['start_test'])
          
          return {
            inline_keyboard: [
              [{ text: button[0], callback_data: 'start_test' }]
            ]
          }
        }
          break
        case 'approve_mail': {
          const button = await findButton(['approve_mail_button','repeat_mail_button'])
          
          return {
            inline_keyboard: [
              [{ text: button[1], callback_data: 'repeat_mail_button' },{ text: button[0], callback_data: 'approve_mail_button' }]
            ]
          }
        }
          break
        case 'buy_courses': {
          const button = await findButton(['payment_button', 'back_button'])
          
          const link = await createPaymentLink({amount: course_array?.price, product: course_array, chat_id})
          
          return {
            inline_keyboard: [
              [
                {
                  text: button[1],
                  url: link
                }
              ],
              [
                {
                  text: button[0],
                  callback_data: 'back_course_button'
                }
              ]
            ]
          }
        }
          break
        case 'result_course': {
          const button = await findButton(['result_course_button', 'back_to_home_button'])
          let button_link = button[1].replace(/{{course_title}}/g, course_array)
          
          return {
            inline_keyboard: [
              [
                {
                  text: button_link,
                  callback_data: `goto_${chat_id}`
                }
              ]
            ]
          }
        }
          break
        
        case 'end_test': {
          const button = await findButton(['end_test'])
          return [{ text: button[0], callback_data: 'end_test' }]
        }
          break
        case 'end_test_repeat': {
          const button = await findButton(['success_end_test_button','decline_end_test_button'])
          return          {
            inline_keyboard: [
              [
                {
                  text: button[1],
                  callback_data: `success_end_test`
                },
                {
                  text: button[0],
                  callback_data: `repeat_test`
                }
              ]
            ]
          }
        }
          break
        
        default:
        {
        
        }
          break
      }
    } catch (e) {
      console.error(e)
    }
  }
}



module.exports = new botButtons();