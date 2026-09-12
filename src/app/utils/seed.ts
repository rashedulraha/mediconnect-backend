import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/browser";
import { prisma } from "../lib/prisma";
import config from "../config";

// create first super admin
export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
      },
    });

    if (isSuperAdminExist) {
      console.log("Super admin is already exist");
      return;
    }

    const name = config.superAdmin.name;
    const email = config.superAdmin.email;
    const password = config.superAdmin.password;

    if (!name || !email || !password) {
      throw new Error("Super admin name,email,password missing");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcryptSaltRounds,
    );

    // create super admin
    const createSuperAmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        imagePublicId: "",
        imageUrl: "",
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        emailVerified: true,
      },
    });

    console.log("super admin created", createSuperAmin);
  } catch (error) {
    console.log("Error seeding super admin ", error);
  }
};
// create first tester admin
export const seedTesterAdmin = async () => {
  try {
    const isTesterAdminExist = await prisma.user.findUnique({
      where: {
        email: config.testerAdmin.email,
      },
    });

    if (isTesterAdminExist) {
      console.log("Tester admin is already exist");
      return;
    }

    const name = config.testerAdmin.name;
    const email = config.testerAdmin.email;
    const password = config.testerAdmin.password;

    if (!name || !email || !password) {
      throw new Error("tester admin name,email,password missing");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcryptSaltRounds,
    );

    // create super admin
    const createTesterAmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        imagePublicId: "",
        imageUrl: "",
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        emailVerified: true,
      },
    });

    console.log("tester admin created", createTesterAmin);
  } catch (error) {
    console.log("Error seeding tester admin ", error);
  }
};

// create first tester doctor
export const seedTesterDoctor = async () => {
  try {
    const isTesterDoctorExist = await prisma.user.findUnique({
      where: {
        email: config.testerDoctor.email,
      },
    });

    if (isTesterDoctorExist) {
      console.log("Tester doctor is already exist");
      return;
    }

    const name = config.testerDoctor.name;
    const email = config.testerDoctor.email;
    const password = config.testerDoctor.password;

    if (!name || !email || !password) {
      throw new Error("tester doctor name,email,password missing");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcryptSaltRounds,
    );

    // create super admin
    const createTesterDoctor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        imagePublicId: "",
        imageUrl: "",
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        emailVerified: true,
      },
    });

    console.log("tester doctor created", createTesterDoctor);
  } catch (error) {
    console.log("Error seeding tester doctor ", error);
  }
};
