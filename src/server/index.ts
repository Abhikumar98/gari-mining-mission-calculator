export enum Tier {
  Silver = 'silver',
  Gold = 'gold',
  Platinum = 'platinum',
}

export interface User {
  streakOrContribution: number;
  tier: Tier;
}

export const getTokensForUsers = ({
  users,
  allotableTokens,
  tierMultiplier,
}: {
  users: User[];
  allotableTokens: number;
  tierMultiplier: Record<Tier, number>;
}) => {
  const tierTokens: Record<Tier, number> = users.reduce(
    (acc, curr) => {
      if (curr.tier === Tier.Silver) {
        acc[Tier.Silver] += curr.streakOrContribution;
      }
      if (curr.tier === Tier.Gold) {
        acc[Tier.Gold] += curr.streakOrContribution;
      }
      if (curr.tier === Tier.Platinum) {
        acc[Tier.Platinum] += curr.streakOrContribution;
      }
      return acc;
    },
    {
      [Tier.Silver]: 0,
      [Tier.Gold]: 0,
      [Tier.Platinum]: 0,
    }
  );

  const { silver, gold, platinum } = tierTokens;

  const totalTierTokens = {
    silver: silver * tierMultiplier.silver,
    gold: gold * tierMultiplier.gold,
    platinum: platinum * tierMultiplier.platinum,
  };

  const {
    silver: totalSilverTokens,
    gold: totalGoldTokens,
    platinum: totalPlatinumTokens,
  } = totalTierTokens;

  const totalTokens = totalSilverTokens + totalGoldTokens + totalPlatinumTokens;

  const allotableSilverTokens =
    (totalSilverTokens / totalTokens) * allotableTokens;

  const allotableGoldTokens = (totalGoldTokens / totalTokens) * allotableTokens;

  const allotablePlatinumTokens =
    (totalPlatinumTokens / totalTokens) * allotableTokens;

  const tokensAllotedPerUser = users.reduce((acc, curr) => {
    switch (curr.tier) {
      case Tier.Silver: {
        const tokensForUser =
          (curr.streakOrContribution / totalSilverTokens) *
          allotableSilverTokens;

        acc.push(tokensForUser);
        break;
      }
      case Tier.Gold: {
        const tokensForUser =
          (curr.streakOrContribution / totalGoldTokens) * allotableGoldTokens;

        acc.push(tokensForUser);
        break;
      }
      case Tier.Platinum: {
        const tokensForUser =
          (curr.streakOrContribution / totalPlatinumTokens) *
          allotablePlatinumTokens;

        acc.push(tokensForUser);
        break;
      }

      default:
        throw new Error('tier not found');
    }

    return acc;
  }, new Array<number>());

  return tokensAllotedPerUser;
};
