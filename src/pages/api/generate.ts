import type { NextApiRequest, NextApiResponse } from 'next';

import { Tier, User } from '@/server';

const generate = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;

    const { goldTier, silverTier, platinumTier, numberOfUsers } =
      JSON.parse(body);

    if (Math.ceil(goldTier + silverTier + platinumTier) != 100) {
      throw new Error('The sum of the tiers must be 100');
    }

    if (!numberOfUsers) {
      throw new Error('Missing number of users');
    }

    const goldTierUsers = Math.ceil((goldTier / 100) * numberOfUsers);
    const silverTierUsers = Math.ceil((silverTier / 100) * numberOfUsers);
    const platinumTierUsers = Math.ceil((platinumTier / 100) * numberOfUsers);

    const maxStreak = 365;
    const maxContribution = 100000;

    const goldTierUsersStreaks: User[] = [...new Array(goldTierUsers)].map(
      (_i) => {
        return {
          streak: Math.floor(Math.random() * maxStreak),
          contribution: Math.floor(Math.random() * maxContribution),
          tier: Tier.Gold,
        };
      }
    );
    const silverTierUsersStreaks: User[] = [...new Array(silverTierUsers)].map(
      (_i) => {
        return {
          streak: Math.floor(Math.random() * maxStreak),
          contribution: Math.floor(Math.random() * maxContribution),
          tier: Tier.Silver,
        };
      }
    );
    const platinumTierUsersStreaks: User[] = [
      ...new Array(platinumTierUsers),
    ].map((_i) => {
      return {
        streak: Math.floor(Math.random() * maxStreak),
        contribution: Math.floor(Math.random() * maxContribution),
        tier: Tier.Platinum,
      };
    });

    res
      .status(200)
      .json([
        ...goldTierUsersStreaks,
        ...silverTierUsersStreaks,
        ...platinumTierUsersStreaks,
      ]);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.status(500).json({ error: (error as any).message });
  }
};

export default generate;
