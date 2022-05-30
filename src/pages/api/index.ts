import type { NextApiRequest, NextApiResponse } from 'next';

import { CurrUser, getTokensForUsers, Tier } from '@/server';

const index = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;
    const {
      silverMultiplier,
      goldMultiplier,
      platinumMultiplier,
      percentageStreak,
      users,
    } = JSON.parse(body);

    if (
      !silverMultiplier ||
      !goldMultiplier ||
      !platinumMultiplier ||
      !percentageStreak
    ) {
      throw new Error('Missing parameters');
    }

    const totalTokensPerDay = 50000;

    const tierMultiplier: Record<Tier, number> = {
      [Tier.Silver]: silverMultiplier,
      [Tier.Gold]: goldMultiplier,
      [Tier.Platinum]: platinumMultiplier,
    };

    const streakBucketAllocationPercentage = percentageStreak / 100; // 10%

    const streakBucket = totalTokensPerDay * streakBucketAllocationPercentage;

    const contributionBucket = totalTokensPerDay - streakBucket; // 90% of total tokens

    const userStreaks: CurrUser[] = users.map(
      ({ streak, tier }: { streak: number; tier: Tier }) => ({
        score: streak,
        tier,
      })
    );
    const userContributions: CurrUser[] = users.map(
      ({ contribution, tier }: { contribution: number; tier: Tier }) => ({
        score: contribution,
        tier,
      })
    );

    const streak = getTokensForUsers({
      users: userStreaks,
      allotableTokens: streakBucket,
      tierMultiplier,
    });

    const contribution = getTokensForUsers({
      users: userContributions,
      allotableTokens: contributionBucket,
      tierMultiplier,
    });

    res.status(200).json({
      streak,
      contribution,
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.status(500).json({ error: (error as any).message });
  }
};

export default index;
