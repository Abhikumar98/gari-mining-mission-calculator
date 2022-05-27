import type { NextApiRequest, NextApiResponse } from 'next';

import { getTokensForUsers, Tier, User } from '@/server';

const index = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;
    const {
      silverMultiplier,
      goldMultiplier,
      platinumMultiplier,
      percentageStreak,
    } = body;

    if (
      !silverMultiplier ||
      !goldMultiplier ||
      !platinumMultiplier ||
      !percentageStreak
    ) {
      throw new Error('Missing parameters');
    }

    const totalTokensPerDay = 50000;
    const users: User[] = [
      {
        streakOrContribution: 2,
        tier: Tier.Silver,
      },
      {
        streakOrContribution: 3,
        tier: Tier.Silver,
      },
      {
        streakOrContribution: 6,
        tier: Tier.Gold,
      },
      {
        streakOrContribution: 1,
        tier: Tier.Gold,
      },
      {
        streakOrContribution: 4,
        tier: Tier.Platinum,
      },
    ];

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
    res.status(500).json({ error: error.message });
  }
};

export default index;
