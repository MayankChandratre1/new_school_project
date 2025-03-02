import mongoose from 'mongoose';
import Student from './models/Student.js';
import PointsHistory from './models/PointsHistory.js';
import bcrypt from 'bcryptjs';
import { Role } from './enum.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

const SCHOOL_ID = "67814ef476c050f995c3c42e";
const TEACHER_ID = "6798760d98b214e441ddb1d1";
const TEACHER_NAME = "Mayank Chandratre";
const FORM_ID = "6798852d2e22a68ddb40954f";

// Generate 50 students
const generateStudents = () => {
  const students = [];
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Emma', 'William', 'Olivia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const uniqueSuffix = `${i.toString().padStart(2, '0')}`;

    students.push({
      name: `${firstName} ${lastName}`,
      email: `student${uniqueSuffix}@school.com`,
      password: "password123",
      grade: "7",
      parentEmail: `parent${uniqueSuffix}@gmail.com`,
      sendNotifications: true,
    });
  }
  return students;
};

const generatePointHistory = (studentId, studentName) => {
  const histories = [];
  const formTypes = [
    { type: 'AwardPoints', minPoints: 50, maxPoints: 123 },
    { type: 'Oopsies', minPoints: -20, maxPoints: -5 },
    { type: 'Withdrawal', minPoints: -50, maxPoints: -25 },
    { type: 'Feedback', minPoints: 0, maxPoints: 0 }
  ];
  
  // Generate 4-5 random point histories for each student
  const numHistories = Math.floor(Math.random() * 2) + 4; // 4-5 histories
  
  for(let i = 0; i < numHistories; i++) {
    const formTypeIndex = 0; // Math.floor(Math.random() * formTypes.length);
    const formType = formTypes[formTypeIndex];
    const points = formType.type === 'Feedback' ? 0 : 
                  Math.floor(Math.random() * (formType.maxPoints - formType.minPoints + 1)) + formType.minPoints;

    // Generate a random date within the last 30 days
    const randomDays = Math.floor(Math.random() * 30);
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    const submittedAt = new Date();
    submittedAt.setDate(submittedAt.getDate() - randomDays);
    submittedAt.setHours(randomHours, randomMinutes);

    histories.push({
      formId: FORM_ID,
      formType: formType.type,
      formName: "Form Test New",
      formSubmissionId: new mongoose.Types.ObjectId(),
      submittedById: TEACHER_ID,
      submittedByName: TEACHER_NAME,
      submittedForId: studentId,
      submittedForName: studentName,
      points,
      schoolId: SCHOOL_ID,
      submittedAt
    });
  }
  
  return histories;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({ schoolId: SCHOOL_ID });
    await PointsHistory.deleteMany({ schoolId: SCHOOL_ID });

    // Create students
    const studentData = generateStudents();
    const createdStudents = [];
    
    for (const student of studentData) {
      const hashedPassword = await bcrypt.hash(student.password, 12);
      const newStudent = await Student.create({
        ...student,
        password: hashedPassword,
        role: Role.Student,
        schoolId: SCHOOL_ID,
      });
      createdStudents.push(newStudent);
    }

    console.log(`Created ${createdStudents.length} students`);

    // Create point histories for each student
    let totalHistories = 0;
    for (const student of createdStudents) {
      const histories = generatePointHistory(student._id, student.name);
      await PointsHistory.insertMany(histories);
      
      // Update student's total points
      const totalPoints = histories.reduce((sum, history) => sum + history.points, 0);
      await Student.findByIdAndUpdate(student._id, { points: totalPoints });
      
      totalHistories += histories.length;
    }

    console.log(`Created ${totalHistories} point history records`);
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
