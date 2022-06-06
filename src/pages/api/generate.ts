import type { NextApiRequest, NextApiResponse } from 'next';

import { Tier, User } from '@/server';

const generate = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;

    const {
      goldTier,
      silverTier,
      diamondTier,
      basicTier,
      freeTier,
      bronzeTier,
      numberOfUsers,
    } = JSON.parse(body);

    if (
      Math.ceil(
        goldTier + silverTier + diamondTier + basicTier + freeTier + bronzeTier
      ) < 100
    ) {
      throw new Error('The sum of the tiers must be 100');
    }

    if (!numberOfUsers) {
      throw new Error('Missing number of users');
    }

    const goldTierUsers = Math.ceil((goldTier / 100) * numberOfUsers);
    const silverTierUsers = Math.ceil((silverTier / 100) * numberOfUsers);
    const basicTierUsers = Math.ceil((basicTier / 100) * numberOfUsers);
    const freeTierUsers = Math.ceil((freeTier / 100) * numberOfUsers);
    const bronzeTierUsers = Math.ceil((bronzeTier / 100) * numberOfUsers);
    const diamondTierUsers = Math.ceil((diamondTier / 100) * numberOfUsers);

    const maxStreak = 365;
    const maxContribution = 100000;

    const tierUsers: Record<Tier, number> = {
      [Tier.Free]: freeTierUsers,
      [Tier.Basic]: basicTierUsers,
      [Tier.Bronze]: bronzeTierUsers,
      [Tier.Silver]: silverTierUsers,
      [Tier.Gold]: goldTierUsers,
      [Tier.Diamond]: diamondTierUsers,
    };

    const users: User[] = Object.entries(tierUsers).reduce<User[]>(
      (acc, [tier, noOfUsers]) => {
        const tierUsers: User[] = [...new Array(noOfUsers)].map((_i) => {
          return {
            streak: Math.floor(Math.random() * maxStreak),
            contribution: Math.floor(Math.random() * maxContribution),
            tier: tier as Tier,
          };
        });

        return [...acc, ...tierUsers];
      },
      []
    );

    res.status(200).json([...users]);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.status(500).json({ error: (error as any).message });
  }
};

export default generate;
