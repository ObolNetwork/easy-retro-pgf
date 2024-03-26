import { TRPCError } from "@trpc/server";
import { type Address, verifyTypedData, keccak256 } from "viem";
import { isAfter } from "date-fns";
import {
  type BallotPublish,
  BallotPublishSchema,
  BallotSchema,
  type Vote,
} from "~/features/ballot/types";
import {
  createTRPCRouter,
  protectedProcedure,
  protectedRoundProcedure,
} from "~/server/api/trpc";
import { ballotTypedData } from "~/utils/typedData";
import { sumBallot } from "~/features/ballot/hooks/useBallot";
import type { Prisma } from "@prisma/client";
import { fetchApprovedVoter } from "~/utils/fetchAttestations";
import { z } from "zod";

const defaultBallotSelect = {
  votes: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  signature: true,
} satisfies Prisma.BallotSelect;

export const ballotRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ roundId: z.string() }))
    .query(({ input: { roundId }, ctx }) => {
      const voterId = ctx.session.user.name!;
      return ctx.db.ballot
        .findFirst({
          select: defaultBallotSelect,
          where: { voterId, roundId },
        })
        .then((ballot) => ({
          ...ballot,
          votes: (ballot?.votes as Vote[]) ?? [],
        }));
    }),
  save: protectedRoundProcedure
    .input(BallotSchema)
    .mutation(async ({ input, ctx }) => {
      const voterId = ctx.session?.user.name as Address;
      const roundId = String(ctx.round?.id);

      const round = await ctx.db.round.findFirst({
        where: { id: roundId },
        select: {
          resultAt: true,
          maxVotesTotal: true,
          maxVotesProject: true,
        },
      });
      const ballot = await ctx.db.ballot.findFirst({
        where: {
          voterId,
          roundId,
        },
      });
      if (![round?.resultAt].every(Boolean)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Round not configured properly",
        });
      }

      if (round?.resultAt && isAfter(new Date(), round.resultAt)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Voting has ended" });
      }
      if (ballot?.publishedAt) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Ballot already published",
        });
      }

      return ballot
        ? ctx.db.ballot.update({
            select: defaultBallotSelect,
            where: { id: ballot?.id, roundId, voterId },
            data: input,
          })
        : ctx.db.ballot.create({
            data: { ...input, roundId, voterId },
          });
    }),
  publish: protectedRoundProcedure
    .input(BallotPublishSchema)
    .mutation(async ({ input, ctx }) => {
      const voterId = ctx.session?.user.name as Address;
      const roundId = ctx.round?.id;
      const round = await ctx.db.round.findFirstOrThrow({
        where: { id: roundId },
        select: {
          resultAt: true,
          maxVotesTotal: true,
          maxVotesProject: true,
        },
      });
      const ballot = await ctx.db.ballot.findFirstOrThrow({
        where: {
          voterId,
          roundId,
        },
      });

      if (![round.resultAt, round.maxVotesTotal].every(Boolean)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Round not configured properly",
        });
      }

      if (isAfter(new Date(), round.resultAt!)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Voting has ended" });
      }

      if (ballot.publishedAt) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Ballot already published",
        });
      }
      if (!verifyBallotCount(ballot.votes as Vote[], round)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Ballot must have a maximum of ${round.maxVotesTotal} votes and ${round.maxVotesProject} per project.`,
        });
      }

      if (!(await fetchApprovedVoter(ctx.round!, voterId))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Voter is not approved",
        });
      }

      if (
        !(await verifyBallotHash(
          input.message.hashed_votes,
          ballot.votes as Vote[],
        ))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Votes hash mismatch",
        });
      }
      const { signature } = input;
      if (!(await verifyBallotSignature({ ...input, address: voterId }))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Signature couldn't be verified",
        });
      }

      return ctx.db.ballot.update({
        where: { id: ballot.id },
        data: { publishedAt: new Date(), signature },
      });
    }),
});

function verifyBallotCount(
  votes: Vote[],
  round: { maxVotesProject: number | null; maxVotesTotal: number | null },
) {
  const sum = sumBallot(votes);
  const validVotes = votes.every(
    (vote) => vote.amount <= (round.maxVotesProject ?? 0),
  );
  return sum <= (round.maxVotesTotal ?? 0) && validVotes;
}

async function verifyBallotHash(hashed_votes: string, votes: Vote[]) {
  return hashed_votes === keccak256(Buffer.from(JSON.stringify(votes)));
}

async function verifyBallotSignature({
  address,
  signature,
  message,
  chainId,
}: { address: string } & BallotPublish) {
  return await verifyTypedData({
    ...ballotTypedData(chainId),
    address: address as Address,
    message,
    signature,
  });
}
