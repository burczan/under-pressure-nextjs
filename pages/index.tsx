import React from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Hero } from '../common/components/Hero';
import { ErrorMessage } from '../common/components/ErrorMessage';
import { PressureDetails } from '../components/PressureDetails';
import { getWeatherHistory } from '../utils';
import { WeatherHistory } from '../types';
import 'bulmaswatch/solar/bulmaswatch.min.css';

type AppProps = {
  data: WeatherHistory;
  error: string | null;
};

const App = ({ data, error }: AppProps) => {
  return (
    <>
      <Head>
        <title>Under Pressure</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="block">
        <Hero
          title="Under Pressure"
          subtitle="Pressure values from last 4 hours"
        />
      </div>
      <div className="columns is-centered">
        <div className="column is-half">
          {error && <ErrorMessage>Could not fetch data.</ErrorMessage>}
          {(!error && data) && <PressureDetails details={data} />}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  let data: AppProps['data'];
  let error: AppProps['error'];

  try {
    data = await getWeatherHistory();
    error = null;
  } catch (err) {
    error = err.message;
    data = null;
  }

  const hour = 3600;

  return {
    props: {
      data,
      error,
    } as AppProps,
    revalidate: hour,
  };
};

export default App;
