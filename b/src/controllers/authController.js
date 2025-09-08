import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerController = async (req, res) => {
  const { name, email, password } = req.body;
   console.log(name)
  if (!name || !email || !password) {
    return res.status(400).send("One field is empty error");
  }

  try {
    const existingUser = await userModel.findOne({ name: name });
    if (existingUser) {
      return res.status(409).send("User alreadyimp exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({ name, email, password: hashedPassword });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      "JWTT",
      {
        expiresIn: "1d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).send("Server error");
    console.log(error);
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Enter both email and password");
  }

  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).send("Server error");
    console.log(error);
  }
};

export default { registerController, loginController };
