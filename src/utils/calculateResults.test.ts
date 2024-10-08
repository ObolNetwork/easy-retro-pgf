import { describe, expect, test } from "vitest";
import { calculateVotes } from "./calculateResults";

describe("Calculate results", () => {
  const ballots = [
    {
      voterId: "voterA",
      votes: [
        {
          projectId: "projectA",
          amount: 20,
        },
        {
          projectId: "projectB",
          amount: 30,
        },
      ],
    },
    {
      voterId: "voterB",
      votes: [
        {
          projectId: "projectA",
          amount: 22,
        },
        {
          projectId: "projectB",
          amount: 50,
        },
      ],
    },
    {
      voterId: "voterC",
      votes: [
        {
          projectId: "projectA",
          amount: 30,
        },
        {
          projectId: "projectB",
          amount: 40,
        },
        {
          projectId: "projectC",
          amount: 60,
        },
      ],
    },
    {
      voterId: "voterD",
      votes: [
        {
          projectId: "projectA",
          amount: 35,
        },
        {
          projectId: "projectC",
          amount: 70,
        },
      ],
    },
  ];
  test("sum payout", () => {
    const { projects } = calculateVotes(ballots, { calculation: "sum" });

    const actual: Record<
      string,
      {
        voters: number;
        votes: number;
      }
    > = {};

    for (const key in projects) {
      if (projects.hasOwnProperty(key)) {
        const { voters, votes } = projects[key]!;
        actual[key] = { voters, votes };
      }
    }
    console.log(actual);
    // ${30 ** 0.5 + 50 ** 0.5 + 40 ** 0.5}
    expect(actual).toMatchInlineSnapshot(`
      {
        "projectA": {
          "voters": 4,
          "votes": ${20 ** 0.5 + 22 ** 0.5 + 30 ** 0.5 + 35 ** 0.5},
        },
        "projectB": {
          "voters": 3,
          "votes": 18.872848707253894,
        },
        "projectC": {
          "voters": 2,
          "votes": ${60 ** 0.5 + 70 ** 0.5},
        },
      }
    `);
  });
  // test("OP-style payout", () => {
  //   const { projects } = calculateVotes(ballots, {
  //     style: "op",
  //     threshold: 3,
  //   });

  //   const actual: Record<
  //     string,
  //     {
  //       voters: number;
  //       votes: number;
  //     }
  //   > = {};

  //   for (const key in projects) {
  //     if (projects.hasOwnProperty(key)) {
  //       const { voters, votes } = projects[key]!;
  //       actual[key] = { voters, votes };
  //     }
  //   }

  //   console.log(actual);
  //   expect(actual).toMatchInlineSnapshot(`
  //     {
  //       "projectA": {
  //         "voters": 4,
  //         "votes": 26,
  //       },
  //       "projectB": {
  //         "voters": 3,
  //         "votes": 40,
  //       },
  //     }
  //   `);
  // });
});
