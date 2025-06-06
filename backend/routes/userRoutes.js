import express from 'express'
import { getUserData, purchaseCourse, userEnrolledCourses, updateUserCourseProgress, getUserCourseProgress} from '../controllers/userController.js'



const userRouter = express.Router()

userRouter.get('/data',getUserData)
userRouter.get('/enrolled-courses',userEnrolledCourses);
userRouter.post('/purchase',purchaseCourse)

userRouter.post('/update-course-progress',updateUserCourseProgress);

userRouter.get('/get-course-progress',getUserCourseProgress);



export default userRouter