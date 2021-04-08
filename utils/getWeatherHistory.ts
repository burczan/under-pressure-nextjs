import puppeteer from 'puppeteer';
import { WeatherHistory } from '../types';

export const getWeatherHistory = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // eslint-disable-next-line max-len
  const chmi = 'https://www.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/prehled-stanic/liberec?l=cz';
  await page.goto(chmi);

  const data: WeatherHistory = await page.evaluate(() => {
    const loadedContent = document.querySelector('#loadedcontent');
    const getNthTable = (n: number) => loadedContent?.querySelector(`table:nth-child(${n})`);
    const getNthTableTextContent = (n: number) => getNthTable(n)?.firstElementChild?.textContent;

    let date: WeatherHistory['date'];
    let latitude: WeatherHistory['location']['latitude'];
    let longitud: WeatherHistory['location']['longitud'];
    let altitude: WeatherHistory['location']['altitude'];
    const pressure: WeatherHistory['pressure'] = [];
    let hour: WeatherHistory['pressure'][number]['hour'];

    const weatherTable = getNthTable(8);
    const weatherRows = Array.from(weatherTable?.firstElementChild?.children as HTMLCollection);
    // eslint-disable-next-line max-len
    const locationName = getNthTableTextContent(3)?.trim() as WeatherHistory['location']['name'];
    const measurementDate = getNthTableTextContent(4);
    const measurementLocationDetails = getNthTableTextContent(5);

    if (measurementDate) {
      const [day, month, year, time, ..._rest] = measurementDate.trim().split(' ');
      const [h, _min] = time.split(':');
      hour = h;
      date = new Date(
        Number(year),
        Number(month.replace('.', '')) - 1,
        Number(day.replace('.', '')),
      ).toDateString();
    }

    if (measurementLocationDetails) {
      const [lat, lon, alt] = measurementLocationDetails.trim().split('     ');
      latitude = lat.split(' ')[0].replace('°', '');
      longitud = lon.split(' ')[0].replace('°', '');
      altitude = alt;
    }

    const pressureRow: string[] | undefined = weatherRows
      .map((row) => (row as HTMLElement).innerText.trim().split('\t'))
      .find((row) => row[0] === 'Tlak vzduchu na stanici')
      ?.slice(1)
      .filter((cell) => cell !== '');

    if (pressureRow) {
      pressureRow.map((cell, i) => {
        const [value, unit] = cell.split(' ');

        pressure.push({
          hour: `${Number(hour) - i}:00`,
          value: Number.parseFloat(value.replace(',', '.')),
          unit,
        });
      });
    }

    return {
      location: {
        name: locationName,
        latitude,
        longitud,
        altitude,
      },
      date,
      pressure,
    };
  });

  await browser.close();
  return data;
};
