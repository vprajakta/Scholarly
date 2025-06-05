import { Webhook } from "svix";

import User from '../models/User.js'

//API controller function to manage clerk user with database

export const clerkWebhooks = async (req, res) =>{
    try {
      const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

      const headers = {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      };

      const evt = whook.verify(req.body, headers); // req.body is raw buffer

      const { data, type } = evt;

      switch (type) {
        case "user.created": {
          const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            name: data.first_name + " " + data.last_name,
            imageUrl: data.image_url,
          };
          await User.create(userData);
          res.status(200).json({});
          break;
        }
        case "user.updated": {
          const userData = {
            email: data.email_addresses[0].email_address,
            name: data.first_name + " " + data.last_name,
            imageUrl: data.image_url,
          };
          await User.findByIdAndUpdate(data.id, userData);
          res.json({});
          break;
        }
        case "user.deleted": {
          await User.findByIdAndDelete(data.id);
          res.json({});
          break;
        }
        default:
          break;
      }
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
    
}
 