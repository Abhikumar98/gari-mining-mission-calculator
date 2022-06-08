import { CurrUser, getTokensForUsers, Tier, User } from '@/server';

export const generateUsers = ({
  goldTier,
  silverTier,
  diamondTier,
  basicTier,
  freeTier,
  bronzeTier,
  numberOfUsers,
}: {
  goldTier: number;
  silverTier: number;
  diamondTier: number;
  basicTier: number;
  freeTier: number;
  bronzeTier: number;
  numberOfUsers: number;
}) => {
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

  return users;
};

export const getUserTokens = ({
  freeMultiplier,
  basicMultiplier,
  bronzeMultiplier,
  silverMultiplier,
  goldMultiplier,
  diamondMultiplier,
  percentageStreak,
  users,
}: {
  freeMultiplier: number;
  basicMultiplier: number;
  bronzeMultiplier: number;
  silverMultiplier: number;
  goldMultiplier: number;
  diamondMultiplier: number;
  percentageStreak: number;
  users: User[];
}) => {
  const totalTokensPerDay = 50000;

  const tierMultiplier: Record<Tier, number> = {
    [Tier.Free]: freeMultiplier,
    [Tier.Basic]: basicMultiplier,
    [Tier.Bronze]: bronzeMultiplier,
    [Tier.Silver]: silverMultiplier,
    [Tier.Gold]: goldMultiplier,
    [Tier.Diamond]: diamondMultiplier,
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

  const { totalAllotableTokens: streakTokens, totalAlloted } = streak;
  const {
    totalAllotableTokens: contributionTokens,
    totalAlloted: contributionAlloted,
  } = contribution;

  // sum of streakTokens and contributionTokens
  const totalTokens = Object.entries(streakTokens).reduce<Record<Tier, number>>(
    (acc, [tier, tokens]) => {
      acc[tier as Tier] += tokens + contributionTokens[tier as Tier];
      return acc;
    },
    {
      [Tier.Free]: 0,
      [Tier.Basic]: 0,
      [Tier.Bronze]: 0,
      [Tier.Silver]: 0,
      [Tier.Gold]: 0,
      [Tier.Diamond]: 0,
    }
  );
  const alloted = Object.entries(totalAlloted).reduce<Record<Tier, number>>(
    (acc, [tier, tokens]) => {
      acc[tier as Tier] += tokens + contributionAlloted[tier as Tier];
      return acc;
    },
    {
      [Tier.Free]: 0,
      [Tier.Basic]: 0,
      [Tier.Bronze]: 0,
      [Tier.Silver]: 0,
      [Tier.Gold]: 0,
      [Tier.Diamond]: 0,
    }
  );

  return {
    streak: streak.tokensAllotedPerUser,
    contribution: contribution.tokensAllotedPerUser,
    totalTokens: {
      tokens: totalTokens,
      alloted,
    },
  };
};
