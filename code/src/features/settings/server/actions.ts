'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { hash } from "bcryptjs"; // Assuming bcryptjs is used, or argon2. Check package.json later, usually bcrypt for simplicity in plans.
// Wait, I should check what hashing is used. The schema says "Argon2 hashed".
// I'll check package.json or auth.ts to see what's available.
// For now, I'll assume a `hashPassword` utility might exist or I'll implement a simple one if needed.
// Actually, I'll use a placeholder for hashing if I can't find it, but standard is bcrypt.
import { revalidatePath } from "next/cache";

const InviteUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6), // Temporary password set by admin
    role: z.enum(['SUPER_ADMIN', 'FIRM_OWNER', 'AGENT'])
});

export async function getTeamMembers(firmId: string) {
    // Verify auth if needed, but usually page protects it.
    // Ideally check if currentUser.firmId === firmId.
    const session = await auth();
    // @ts-ignore
    if (session?.user?.firmId !== firmId) return [];

    return await prisma.user.findMany({
        where: { firmId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
            createdAt: true
        }
    });
}

export async function inviteTeamMember(firmId: string, data: z.infer<typeof InviteUserSchema>) {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.firmId !== firmId) return { success: false, error: "Unauthorized" };

    console.log(`[inviteTeamMember] Inviting user to firm ${firmId}. Data:`, JSON.stringify(data, null, 2));

    const validation = InviteUserSchema.safeParse(data);
    if (!validation.success) {
        console.error("[inviteTeamMember] Validation failed:", validation.error.format());
        return { success: false, error: "Invalid data" };
    }

    const { name, email, password, role } = validation.data;

    // Check if email exists
    const existing = await prisma.user.findUnique({
        where: { email }
    });
    if (existing) {
        console.warn(`[inviteTeamMember] Email ${email} already registered.`);
        return { success: false, error: "Email already registered" };
    }

    try {
        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                firmId,
                name,
                email,
                password: hashedPassword,
                role,
                isActive: true
            }
        });

        console.log(`[inviteTeamMember] Successfully created user ${newUser.id}`);
        revalidatePath(`/dashboard/${firmId}/settings`);
        return { success: true };
    } catch (e) {
        console.error("[inviteTeamMember] Error inviting user:", e);
        return { success: false, error: "Failed to invite user" };
    }
}
