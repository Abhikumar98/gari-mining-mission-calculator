import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { creatCsvFile, downloadFile } from 'download-csv';
import * as React from 'react';
import { Pie } from 'react-chartjs-2';
import toast, { Toaster } from 'react-hot-toast';

import { Tier, User } from '@/server';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.
interface Result {
  streak: number[];
  contribution: number[];
}
export default function HomePage() {
  const [multiplier, setMultiplier] = React.useState<Record<Tier, number>>({
    free: 1,
    basic: 2,
    bronze: 3,
    silver: 4,
    gold: 5,
    diamond: 10,
  });

  const handleMultiplierChange = (value: number) => (key: Tier) => {
    if (typeof key !== 'undefined' && value) {
      setMultiplier((prev) => ({ ...prev, [key]: value }));
    }
  };
  const [percentageStreak, setPercentageStreak] = React.useState(0);
  const [totalTokens, setTotalTokens] = React.useState<{
    tokens: Record<Tier, number>;
    alloted: Record<Tier, number>;
  } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = React.useState<Result | null>(null);
  const [randomData, setRandomData] = React.useState<User[]>([]);

  // number of users, gold, silver, and platinum tier numbers state
  const [users, setUsers] = React.useState(0);

  const [userProportion, setUserProportion] = React.useState<
    Record<Tier, number>
  >({ free: 50, basic: 20, bronze: 10, silver: 7.5, gold: 7.5, diamond: 5 });

  const handleUserProportionChange = (value: number) => (key: Tier) => {
    if (typeof key !== 'undefined' && value) {
      setUserProportion((prev) => ({ ...prev, [key]: value }));
    }
  };

  const getTokensAllocation = async () => {
    try {
      const body = {
        freeMultiplier: multiplier.free,
        basicMultiplier: multiplier.basic,
        bronzeMultiplier: multiplier.bronze,
        silverMultiplier: multiplier.silver,
        goldMultiplier: multiplier.gold,
        diamondMultiplier: multiplier.diamond,
        percentageStreak,
        users: randomData,
      };

      const response = await fetch('/api', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setTotalTokens(data.totalTokens);
      // eslint-disable-next-line no-console
      if (!data.error) {
        setResult(data);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error({ err });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any).message ?? 'Something went wrong');
    }
  };

  const generateData = async () => {
    try {
      const sumOfUserProportions = Object.values(userProportion).reduce(
        (acc, curr) => acc + curr,
        0
      );
      if (Math.ceil(sumOfUserProportions) != 100) {
        toast.error('Total tier percentage must be 100');
        return;
      }

      if (users < 1) {
        toast.error('Invalid users');
        return;
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          goldTier: userProportion.gold,
          silverTier: userProportion.silver,
          bronzeTier: userProportion.bronze,
          freeTier: userProportion.free,
          diamondTier: userProportion.diamond,
          basicTier: userProportion.basic,
          numberOfUsers: users,
        }),
      });
      const data = await response.json();
      setRandomData(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error({ err });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any).message ?? 'Something went wrong');
    }
  };
  ChartJS.register(ArcElement, Tooltip, Legend);

  const handleCSVDownload = () => {
    if (!randomData) {
      toast.error('No data to download');
      return;
    }
    const datas = randomData?.map((user, index) => {
      return {
        users: index + 1,
        tier: user.tier,
        streak_score: user.streak,
        contribution_score: user.contribution,
        streak_tokens: result?.streak[index] ?? 0,
        contribution_tokens: result?.contribution[index] ?? 0,
        total_tokens:
          Number(
            (result?.contribution[index] ?? 0) + (result?.streak[index] ?? 0)
          ).toFixed(2) ?? 0,
      };
    });

    const columns = {
      users: 'Users',
      tier: 'Tier',
      streak_score: 'Streak Score',
      contribution_score: 'Contribution Score',
      streak_tokens: 'Streak Tokens',
      contribution_tokens: 'Contribution Tokens',
      total_tokens: 'Total Tokens',
    };

    const csvFile = creatCsvFile(datas, columns); // return csvfile
    downloadFile(csvFile, 'Gari token'); // browser download file
  };

  const data = {
    labels: ['Free', 'Basic', 'Bronze', 'Silver', 'Gold', 'Diamond'],
    datasets: [
      {
        label: 'Token Distribution',
        data: [
          totalTokens?.tokens?.free ?? 0,
          totalTokens?.tokens?.basic ?? 0,
          totalTokens?.tokens?.bronze ?? 0,
          totalTokens?.tokens?.silver ?? 0,
          totalTokens?.tokens?.gold ?? 0,
          totalTokens?.tokens?.diamond ?? 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const userTokens = {
    labels: ['Free', 'Basic', 'Bronze', 'Silver', 'Gold', 'Diamond'],
    datasets: [
      {
        label: 'Token Distribution',
        data: [
          totalTokens?.alloted?.free ?? 0,
          totalTokens?.alloted?.basic ?? 0,
          totalTokens?.alloted?.bronze ?? 0,
          totalTokens?.alloted?.silver ?? 0,
          totalTokens?.alloted?.gold ?? 0,
          totalTokens?.alloted?.diamond ?? 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className='h-screen w-screen'>
      <div className='flex h-full w-full space-x-20 bg-white p-8'>
        <div className='flex h-auto max-w-6xl space-x-4'>
          <div className='h-auto rounded-md border p-4'>
            <div className='mb-8'>Generated User list</div>
            <div className='grid grid-cols-7 border-t border-b border-l py-2 text-sm font-extrabold'>
              <div className='border-r px-2 text-center'>Users</div>
              <div className='border-r px-2 text-center'>Tier</div>
              <div className='border-r px-2 text-center'>Streak Score</div>
              <div className='border-r px-2 text-center text-xs'>
                Contribution Score
              </div>
              <div className='border-r px-2 text-center'>Streak Tokens</div>
              <div className='border-r px-2 text-center text-xs'>
                Contribution Tokens
              </div>
              <div className='border-r px-2 text-center'>Total Tokens</div>
            </div>
            <div className='max-height-box '>
              {randomData?.map((user, index) => {
                return (
                  <div key={index} className='group grid grid-cols-7 border-b'>
                    <div className=' mt-0 border-x px-2 text-center group-hover:bg-indigo-600 group-hover:text-white'>
                      {index + 1}
                    </div>
                    <div className=' mt-0 border-r px-2 group-hover:bg-indigo-600 group-hover:text-white'>
                      {user.tier}
                    </div>
                    <div className=' mt-0 border-r px-2 group-hover:bg-indigo-600 group-hover:text-white'>
                      {user.streak}
                    </div>
                    <div className=' mt-0 border-r px-2 group-hover:bg-indigo-600 group-hover:text-white'>
                      {user.contribution}
                    </div>
                    <div className=' mt-0 border-r px-2 group-hover:bg-indigo-600 group-hover:text-white'>
                      {result?.streak[index] ?? '--'}
                    </div>
                    <div className=' mt-0 border-r px-2 group-hover:bg-indigo-600 group-hover:text-white'>
                      {result?.contribution[index] ?? '--'}
                    </div>
                    <div className=' mt-0 border-r px-2 group-hover:bg-indigo-600 group-hover:text-white'>
                      {Number(
                        (result?.contribution[index] ?? 0) +
                          (result?.streak[index] ?? 0)
                      ).toFixed(2) ?? '--'}
                    </div>
                  </div>
                );
              })}
              {!randomData && (
                <div className='mt-12 flex items-center justify-center'>
                  No users generated
                </div>
              )}
            </div>
          </div>
        </div>

        <div className=''>
          <div className='border-b'>
            <section className='flex flex-col'>
              <div className='my-4'>
                <div className=' font-semibold underline'>
                  Generate User List
                </div>
                <div className='my-2 flex space-x-4'>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Free_user'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Free %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={userProportion[Tier.Free]}
                        onChange={(e) =>
                          handleUserProportionChange(Number(e.target.value))(
                            Tier.Free
                          )
                        }
                        type='number'
                        name='free_user'
                        id='free_user'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Basic_user'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Basic %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={userProportion[Tier.Basic]}
                        onChange={(e) =>
                          handleUserProportionChange(Number(e.target.value))(
                            Tier.Basic
                          )
                        }
                        type='number'
                        name='Basic_user'
                        id='Basic_user'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Bronze_user'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Bronze %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={userProportion[Tier.Bronze]}
                        onChange={(e) =>
                          handleUserProportionChange(Number(e.target.value))(
                            Tier.Bronze
                          )
                        }
                        type='number'
                        name='Bronze_user'
                        id='Bronze_user'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                </div>
                <div className='my-2 flex space-x-4'>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Silver_user'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Silver %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={userProportion[Tier.Silver]}
                        onChange={(e) =>
                          handleUserProportionChange(Number(e.target.value))(
                            Tier.Silver
                          )
                        }
                        type='number'
                        name='Silver_user'
                        id='Silver_user'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Gold_user'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Gold %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={userProportion[Tier.Gold]}
                        onChange={(e) =>
                          handleUserProportionChange(Number(e.target.value))(
                            Tier.Gold
                          )
                        }
                        type='number'
                        name='Gold_user'
                        id='Gold_user'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Diamond_user'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Diamond %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={userProportion[Tier.Diamond]}
                        onChange={(e) =>
                          handleUserProportionChange(Number(e.target.value))(
                            Tier.Diamond
                          )
                        }
                        type='number'
                        name='Diamond_user'
                        id='Diamond_user'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className='mb-4 flex flex-col items-start justify-start'>
                <label
                  htmlFor='percentage'
                  className='block text-sm font-medium text-gray-700'
                >
                  Number of users
                </label>
                <div className='mt-1'>
                  <input
                    value={users}
                    onChange={(e) => setUsers(Number(e.target.value))}
                    type='number'
                    name='percentage'
                    id='percentage'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    placeholder='1'
                  />
                </div>
              </div>

              <div className='m-4 ml-0 flex items-start'>
                <button
                  type='button'
                  className=' w-auto items-center rounded-md border border-transparent bg-indigo-600 px-8 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  onClick={generateData}
                >
                  Generate user list
                </button>
              </div>
            </section>
          </div>
          <div>
            <section className='flex flex-col'>
              <div className='my-4'>
                <div className=' font-semibold underline'>Multipliers</div>
                <div className='my-2 flex space-x-4'>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='free'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Free
                    </label>
                    <div className='mt-1'>
                      <input
                        value={multiplier[Tier.Free]}
                        onChange={(e) =>
                          handleMultiplierChange(Number(e.target.value))(
                            Tier.Free
                          )
                        }
                        type='number'
                        name='free'
                        id='free'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Basic'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Basic
                    </label>
                    <div className='mt-1'>
                      <input
                        value={multiplier[Tier.Basic]}
                        onChange={(e) =>
                          handleMultiplierChange(Number(e.target.value))(
                            Tier.Basic
                          )
                        }
                        type='number'
                        name='Basic'
                        id='Basic'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Bronze'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Bronze
                    </label>
                    <div className='mt-1'>
                      <input
                        value={multiplier[Tier.Bronze]}
                        onChange={(e) =>
                          handleMultiplierChange(Number(e.target.value))(
                            Tier.Bronze
                          )
                        }
                        type='number'
                        name='Bronze'
                        id='Bronze'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                </div>
                <div className='my-2 flex space-x-4'>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='silver'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Silver
                    </label>
                    <div className='mt-1'>
                      <input
                        value={multiplier[Tier.Silver]}
                        onChange={(e) =>
                          handleMultiplierChange(Number(e.target.value))(
                            Tier.Silver
                          )
                        }
                        type='number'
                        name='silver'
                        id='silver'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Gold'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Gold
                    </label>
                    <div className='mt-1'>
                      <input
                        value={multiplier[Tier.Gold]}
                        onChange={(e) =>
                          handleMultiplierChange(Number(e.target.value))(
                            Tier.Gold
                          )
                        }
                        type='number'
                        name='Gold'
                        id='Gold'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='Diamond'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Diamond
                    </label>
                    <div className='mt-1'>
                      <input
                        value={multiplier[Tier.Diamond]}
                        onChange={(e) =>
                          handleMultiplierChange(Number(e.target.value))(
                            Tier.Diamond
                          )
                        }
                        type='number'
                        name='Diamond'
                        id='Diamond'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className='mb-4 flex flex-col items-start justify-start'>
                <label
                  htmlFor='percentage'
                  className='block text-sm font-medium text-gray-700'
                >
                  Percentage for streak bucket
                </label>
                <div className='mt-1'>
                  <input
                    value={percentageStreak}
                    onChange={(e) =>
                      setPercentageStreak(Number(e.target.value))
                    }
                    type='number'
                    name='percentage'
                    id='percentage'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    placeholder='1'
                  />
                </div>
              </div>

              <div className='mr-4 mb-4 flex items-start'>
                <button
                  type='button'
                  className=' w-auto items-center rounded-md border border-transparent bg-indigo-600 px-8 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  onClick={getTokensAllocation}
                >
                  Calculate
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className='my-8 block'>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex justify-center space-x-8'>
            <div className='flex flex-col items-center'>
              <div className='font-semibold '>Token distribution</div>
              <div className='h-96 w-96'>
                <Pie data={data} />
              </div>
            </div>
            <div className='flex flex-col items-center'>
              <div className='font-semibold '>User Token distribution</div>
              <div className='h-96 w-96'>
                <Pie data={userTokens} />
              </div>
            </div>
          </div>
          <div className='m-4 flex items-start'>
            <button
              type='button'
              className=' w-auto items-center rounded-md border border-transparent bg-indigo-600 px-8 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              onClick={handleCSVDownload}
            >
              Download CSV
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
