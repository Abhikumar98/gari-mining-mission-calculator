import * as React from 'react';
import toast, { Toaster } from 'react-hot-toast';

import Layout from '@/components/layout/Layout';

import { User } from '@/server';

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
  const [silverMultiplier, setSilverMultiplier] = React.useState(1);
  const [goldMultiplier, setGoldMultiplier] = React.useState(2);
  const [platinumMultiplier, setPlatinumMultiplier] = React.useState(3);
  const [percentageStreak, setPercentageStreak] = React.useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = React.useState<Result | null>(null);
  const [randomData, setRandomData] = React.useState<User[]>([]);

  // number of users, gold, silver, and platinum tier numbers state
  const [users, setUsers] = React.useState(0);
  const [gold, setGold] = React.useState(0);
  const [silver, setSilver] = React.useState(0);
  const [platinum, setPlatinum] = React.useState(0);

  const getTokensAllocation = async () => {
    try {
      const body = {
        silverMultiplier,
        goldMultiplier,
        platinumMultiplier,
        percentageStreak,
        users: randomData,
      };

      const response = await fetch('/api', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await response.json();
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
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          goldTier: gold,
          silverTier: silver,
          platinumTier: platinum,
          numberOfUsers: users,
        }),
      });

      if (Math.ceil(gold + silver + platinum) != 100) {
        toast.error('Total tier percentage must be 100');
        return;
      }
      if (users < 1) {
        toast.error('Invalid users');
        return;
      }
      const data = await response.json();
      setRandomData(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error({ err });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any).message ?? 'Something went wrong');
    }
  };

  return (
    <Layout>
      <main className='flex space-x-20 bg-white p-8'>
        <div className='flex space-x-4'>
          <div className='rounded-md border p-4'>
            <div className='mb-8'>Streak Simulation</div>
            <div className='flex space-y-1 border-b font-extrabold'>
              <div className='w-36'>Users</div>
              <div className='w-48'>Streak Score</div>
              <div className='w-64'>Contribution Score</div>
              <div className='w-48'>Streak Tokens</div>
              <div className='w-64'>Contribution Tokens</div>
              <div className='w-48'>Total Tokens</div>
            </div>
            <div className='max-height-box'>
              {randomData?.map((user, index) => {
                return (
                  <div key={index} className='flex space-y-1 border-b'>
                    <div className='w-36'>#{index + 1}</div>
                    <div className='w-48'>{user.streak}</div>
                    <div className='w-64'>{user.contribution}</div>
                    <div className='w-48'>{result?.streak[index]}</div>
                    <div className='w-64'>{result?.contribution[index]}</div>
                    <div className='w-48'>
                      {Number(
                        (result?.contribution[index] ?? 0) +
                          (result?.streak[index] ?? 0)
                      ).toFixed(2)}
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
          <div>
            <section className='flex'>
              <div className='my-8'>
                <div>Generate User List</div>
                <div className='my-4 flex space-x-4'>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='silver'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Silver %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={silver}
                        onChange={(e) => setSilver(Number(e.target.value))}
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
                      htmlFor='gold'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Gold %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={gold}
                        onChange={(e) => setGold(Number(e.target.value))}
                        type='number'
                        name='gold'
                        id='gold'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='platinum'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Platinum %
                    </label>
                    <div className='mt-1'>
                      <input
                        value={platinum}
                        onChange={(e) => setPlatinum(Number(e.target.value))}
                        type='number'
                        name='platinum'
                        id='platinum'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
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
              </div>
            </section>
          </div>
          <div>
            <section className='flex'>
              <div className='my-8'>
                <div>Multipliers</div>
                <div className='my-4 flex space-x-4'>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='silver'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Silver
                    </label>
                    <div className='mt-1'>
                      <input
                        value={silverMultiplier}
                        onChange={(e) =>
                          setSilverMultiplier(Number(e.target.value))
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
                      htmlFor='gold'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Gold
                    </label>
                    <div className='mt-1'>
                      <input
                        value={goldMultiplier}
                        onChange={(e) =>
                          setGoldMultiplier(Number(e.target.value))
                        }
                        type='number'
                        name='gold'
                        id='gold'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
                    </div>
                  </div>
                  <div className='mb-4 flex flex-col items-start justify-start'>
                    <label
                      htmlFor='platinum'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Platinum
                    </label>
                    <div className='mt-1'>
                      <input
                        value={platinumMultiplier}
                        onChange={(e) =>
                          setPlatinumMultiplier(Number(e.target.value))
                        }
                        type='number'
                        name='platinum'
                        id='platinum'
                        className='block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        placeholder='1'
                      />
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
              </div>
            </section>
          </div>
        </div>
      </main>
      <Toaster />
    </Layout>
  );
}
