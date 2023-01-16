import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const bookRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        isbn13: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        isbn10: z.string().optional(),
        cover: z.string().optional(),
        authors: z
          .array(
            z.union([
              z.string(),
              z.object({
                name: z.string(),
                image: z.string().optional(),
              }),
            ])
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authors = [];
      for (const author of input.authors || []) {
        if (typeof author === "string") {
          const authorObj = await ctx.prisma.author.findUnique({
            where: { id: author },
          });
          if (authorObj) authors.push(authorObj);
        } else if (author !== null && "name" in author) {
          authors.push(author);
        }
      }
      return ctx.prisma.book.create({
        data: {
          ...input,
          authors: {
            create: authors,
          },
        },
      });
    }),
});
