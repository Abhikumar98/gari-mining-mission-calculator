import * as React from 'react';

import Layout from '@/components/layout/Layout';

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

export default function HomePage() {
  const [silverMultiplier, setSilverMultiplier] = React.useState(1);
  const [goldMultiplier, setGoldMultiplier] = React.useState(2);
  const [platinumMultiplier, setPlatinumMultiplier] = React.useState(3);
  const [percentageStreak, setPercentageStreak] = React.useState(0);

  const getTokensAllocation = async () => {
    try {
      const body = {
        silverMultiplier,
        goldMultiplier,
        platinumMultiplier,
        percentageStreak,
      };

      const response = await fetch('/api', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log({ data });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <Layout>
      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen max-w-xl flex-col justify-center text-center'>
            <div className='mb-4 flex flex-col items-start justify-start'>
              <label
                htmlFor='silver'
                className='block text-sm font-medium text-gray-700'
              >
                Silver Multiplier
              </label>
              <div className='mt-1'>
                <input
                  value={silverMultiplier}
                  onChange={(e) => setSilverMultiplier(Number(e.target.value))}
                  type='number'
                  name='silver'
                  id='silver'
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  placeholder='1'
                />
              </div>
            </div>
            <div className='mb-4 flex flex-col items-start justify-start'>
              <label
                htmlFor='gold'
                className='block text-sm font-medium text-gray-700'
              >
                Gold Multiplier
              </label>
              <div className='mt-1'>
                <input
                  value={goldMultiplier}
                  onChange={(e) => setGoldMultiplier(Number(e.target.value))}
                  type='number'
                  name='gold'
                  id='gold'
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  placeholder='1'
                />
              </div>
            </div>
            <div className='mb-4 flex flex-col items-start justify-start'>
              <label
                htmlFor='platinum'
                className='block text-sm font-medium text-gray-700'
              >
                Platinum Multiplier
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
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  placeholder='1'
                />
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
                  onChange={(e) => setPercentageStreak(Number(e.target.value))}
                  type='number'
                  name='percentage'
                  id='percentage'
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  placeholder='1'
                />
              </div>
            </div>

            <div className='flex items-start'>
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
      </main>
    </Layout>
  );
}
