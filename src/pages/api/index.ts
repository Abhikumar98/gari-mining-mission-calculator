import type { NextApiRequest, NextApiResponse } from 'next';

import { getTokensForUsers, Tier, users } from '@/server';

const index = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;
    const {
      silverMultiplier,
      goldMultiplier,
      platinumMultiplier,
      percentageStreak,
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

    const streakTokensPerUser = getTokensForUsers({
      users,
      allotableTokens: streakBucket,
      tierMultiplier,
    });

    const contributionTokensPerUser = getTokensForUsers({
      users,
      allotableTokens: contributionBucket,
      tierMultiplier,
    });

    res.status(200).json({
      streakTokensPerUser,
      contributionTokensPerUser,
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.status(500).json({ error: (error as any).message });
  }
};

export default index;
