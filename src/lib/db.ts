import { PrismaClient } from '@prisma/client'
import { JsonObject } from '@prisma/client/runtime/library';

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const db = prisma;


export async function getUserByAccount(account:any){
    console.log(account);
}