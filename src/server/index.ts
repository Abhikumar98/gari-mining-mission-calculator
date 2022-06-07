export enum Tier {
  Free = 'free',
  Basic = 'basic',
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Diamond = 'diamond',
}

export interface User {
  streak: number;
  contribution: number;
  tier: Tier;
}

export interface CurrUser {
  score: number;
  tier: Tier;
}

export const getTokensForUsers = ({
  users,
  allotableTokens,
  tierMultiplier,
}: {
  users: CurrUser[];
  allotableTokens: number;
  tierMultiplier: Record<Tier, number>;
}) => {
  const tierTokens: Record<Tier, number> = users.reduce(
    (acc, curr) => {
      acc[curr.tier] += curr.score;
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

  const { silver, gold, diamond, basic, free, bronze } = tierTokens;

  const totalTierTokens = {
    silver: silver * tierMultiplier.silver,
    gold: gold * tierMultiplier.gold,
    diamond: diamond * tierMultiplier.diamond,
    basic: basic * tierMultiplier.basic,
    free: free * tierMultiplier.free,
    bronze: bronze * tierMultiplier.bronze,
  };

  const {
    silver: totalSilverTokens,
    gold: totalGoldTokens,
    diamond: totalPlatinumTokens,
    basic: totalBasicTokens,
    free: totalFreeTokens,
    bronze: totalBronzeTokens,
  } = totalTierTokens;

  const totalTokens =
    totalSilverTokens +
    totalGoldTokens +
    totalPlatinumTokens +
    totalBasicTokens +
    totalFreeTokens +
    totalBronzeTokens;

  const allotableSilverTokens =
    (totalSilverTokens / totalTokens) * allotableTokens;

  const allotableGoldTokens = (totalGoldTokens / totalTokens) * allotableTokens;

  const allotablePlatinumTokens =
    (totalPlatinumTokens / totalTokens) * allotableTokens;

  const allotableBasicTokens =
    (totalBasicTokens / totalTokens) * allotableTokens;

  const allotableFreeTokens = (totalFreeTokens / totalTokens) * allotableTokens;

  const allotableBronzeTokens =
    (totalBronzeTokens / totalTokens) * allotableTokens;

  const totalAllotableTokens: Record<Tier, number> = {
    [Tier.Silver]: Number(allotableSilverTokens.toFixed(2)),
    [Tier.Gold]: Number(allotableGoldTokens.toFixed(2)),
    [Tier.Diamond]: Number(allotablePlatinumTokens.toFixed(2)),
    [Tier.Basic]: Number(allotableBasicTokens.toFixed(2)),
    [Tier.Free]: Number(allotableFreeTokens.toFixed(2)),
    [Tier.Bronze]: Number(allotableBronzeTokens.toFixed(2)),
  };
  const totalAlloted: Record<Tier, number> = {
    [Tier.Silver]: 0,
    [Tier.Gold]: 0,
    [Tier.Diamond]: 0,
    [Tier.Basic]: 0,
    [Tier.Free]: 0,
    [Tier.Bronze]: 0,
  };

  const tokensAllotedPerUser = users.reduce((acc, curr) => {
    switch (curr.tier) {
      case Tier.Silver: {
        const tokensForUser =
          (curr.score / totalSilverTokens) * allotableSilverTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        totalAlloted[Tier.Silver] += Number(tokensForUser.toFixed(2));
        break;
      }
      case Tier.Gold: {
        const tokensForUser =
          (curr.score / totalGoldTokens) * allotableGoldTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        totalAlloted[Tier.Gold] += Number(tokensForUser.toFixed(2));
        break;
      }
      case Tier.Diamond: {
        const tokensForUser =
          (curr.score / totalPlatinumTokens) * allotablePlatinumTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        totalAlloted[Tier.Diamond] += Number(tokensForUser.toFixed(2));
        break;
      }
      case Tier.Basic: {
        const tokensForUser =
          (curr.score / totalBasicTokens) * allotableBasicTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        totalAlloted[Tier.Basic] += Number(tokensForUser.toFixed(2));
        break;
      }
      case Tier.Free: {
        const tokensForUser =
          (curr.score / totalFreeTokens) * allotableFreeTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        totalAlloted[Tier.Free] += Number(tokensForUser.toFixed(2));
        break;
      }

      case Tier.Bronze: {
        const tokensForUser =
          (curr.score / totalBronzeTokens) * allotableBronzeTokens;

        acc.push(Number(tokensForUser.toFixed(2)));
        totalAlloted[Tier.Bronze] += Number(tokensForUser.toFixed(2));
        break;
      }

      default:
        throw new Error('tier not found');
    }

    return acc;
  }, new Array<number>());

  return { tokensAllotedPerUser, totalAllotableTokens, totalAlloted };
};
