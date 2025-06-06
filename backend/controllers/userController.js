import User from '../models/User.js'
import Course from '../models/Course.js';
import Purchase from '../models/Purchase.js';
import Stripe from 'stripe';

export const getUserData = async (req,res)=>{
    try{
        const userId = req.auth().userId;
        const user = await  User.findById(userId)
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }
        res.json({success: true, user});
    }catch(error){
        res.json({success:false, message:error.message})
    }
}

//get users enrolled courses with lecture links

export const userEnrolledCourses = async (req,res)=>{
    try {
        const userId = req.auth().userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success:true, enrolledCourses : userData.enrolledCourses})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// export const purchaseCourse = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const { origin } = req.headers;
//     const userId = req.auth().userId;
//     const userData = await User.findById(userId);
//     const courseData = await Course.findById(courseId);

//     if (!userData || !courseData)
//       return res.json({ success: false, message: "Data not found" });
//     const purchaseData = {
//       courseId: courseData._id,
//       userId,
//       amount:parseFloat( (
//         courseData.coursePrice -
//         (courseData.discount * courseData.coursePrice) / 100
//       ).toFixed(2)),
//     };

//     const newPurchase = await Purchase.create(purchaseData);

//     //stripe gateway initialize
//     const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
//     const currency = process.env.CURRENCY.toLowerCase()

//     //creating line items to for stripe
//     const line_items = [{
//         price_data:{
//             currency,
//             product_data: {
//                 name: courseData.courseTitle
//             },
//             unit_amount: Math.round(newPurchase.amount*100)
//         },
//         quantity: 1
//     }]

//     const session = await stripeInstance.checkout.sessions.create({
//         success_url: `${origin}/loading/my-enrollments`,
//         cancel_url: `${origin}`,
//         line_items: line_items,
//         mode: 'payment',
//         metadata: {
//             purchaseId: newPurchase._id.toString()
//         }
//     })
//     res.json({success:true, session_url: session.url})
//   } catch (error) {
//     console.log(error.message)
//     res.json({success:false, message:error.message})
//   }
// };

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth().userId;

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data not found" });
    }

    // ✅ Ensure amount is number
    const finalAmount = parseFloat(
      (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2)
    );

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: finalAmount,
    };

    const newPurchase = await Purchase.create(purchaseData);

    // ✅ Stripe Setup
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = (process.env.CURRENCY  || "USD").toLowerCase(); // Fallback

    // ✅ Safe Logging
    console.log({
      finalAmount,
      unit_amount: Math.round(finalAmount * 100),
      currency,
      title: courseData.courseTitle,
    });

    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle || "Course",
          },
          unit_amount: Math.round(finalAmount * 100), // must be integer (cents)
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}`,
      line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("🔥 Stripe Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
  