export enum Tier {
  Silver = 'silver',
  Gold = 'gold',
  Platinum = 'platinum',
}

export interface User {
  score: number;
  tier: Tier;
}

export const users: User[] = [
  {
    score: 2,
    tier: Tier.Silver,
  },
  {
    score: 3,
    tier: Tier.Silver,
  },
  {
    score: 6,
    tier: Tier.Gold,
  },
  {
    score: 1,
    tier: Tier.Gold,
  },
  {
    score: 4,
    tier: Tier.Platinum,
  },
];

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
        acc[Tier.Silver] += curr.score;
      }
      if (curr.tier === Tier.Gold) {
        acc[Tier.Gold] += curr.score;
      }
      if (curr.tier === Tier.Platinum) {
        acc[Tier.Platinum] += curr.score;
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
          (curr.score / totalSilverTokens) * allotableSilverTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        break;
      }
      case Tier.Gold: {
        const tokensForUser =
          (curr.score / totalGoldTokens) * allotableGoldTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        break;
      }
      case Tier.Platinum: {
        const tokensForUser =
          (curr.score / totalPlatinumTokens) * allotablePlatinumTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        break;
      }

      default:
        throw new Error('tier not found');
    }

    return acc;
  }, new Array<number>());

  return tokensAllotedPerUser;
};
