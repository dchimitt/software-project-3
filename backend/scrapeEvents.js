const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mysql = require('mysql2');
const cron = require('node-cron');
require('dotenv').config();

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'student_life'
});

async function scrapeEvents() {
    console.log("Launching Puppeteer...");

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.pnw.edu/events/category/student-life/', { waitUntil: 'networkidle2' });

    const html = await page.content();
    const $ = cheerio.load(html);

    const events = [];

    $('.tribe-events-calendar-list__event').each(async (i, elem) => {
        const event_name = $(elem).find('.tribe-events-calendar-list__event-title a').text().trim();
        const event_datetime = $(elem).find('.tribe-events-calendar-list__event-datetime').attr('datetime');
        const event_date = event_datetime ? event_datetime.split('T')[0] : null;
        const abstract = $(elem).find('.tribe-events-calendar-list__event-description').text().trim();

        // Get event detail link
        const event_link = $(elem).find('.tribe-events-calendar-list__event-title a').attr('href');

        let location = 'PNW Campus'; // Default

        if (event_link) {
            try {
                const detailPage = await browser.newPage();
                await detailPage.goto(event_link, { waitUntil: 'domcontentloaded' });
                const detailHtml = await detailPage.content();
                const $$ = cheerio.load(detailHtml);

                // Now try to find specific location
                location = $$('.tribe-events-single-event-venue__name').text().trim() || 'PNW Campus';
                await detailPage.close();
            } catch (error) {
                console.error(`Error fetching detail page for event: ${event_name}`, error);
            }
        }

        if (event_name && event_date) {
            events.push({ event_name, event_date, abstract, location });
        }
    });




    console.log('Scraped events:', events);

    // await browser.close();

    const eventElems = $('.tribe-events-calendar-list__event');

    for (let i = 0; i < eventElems.length; i++) {
        const elem = eventElems[i];

        const event_name = $(elem).find('.tribe-events-calendar-list__event-title a').text().trim();
        const event_datetime = $(elem).find('.tribe-events-calendar-list__event-datetime').attr('datetime');
        const event_date = event_datetime ? event_datetime.split('T')[0] : null;
        const abstract = $(elem).find('.tribe-events-calendar-list__event-description').text().trim();
        const event_link = $(elem).find('.tribe-events-calendar-list__event-title a').attr('href');

        let location = 'PNW Campus'; // Default

        if (event_link) {
            try {
                const detailPage = await browser.newPage();
                await detailPage.goto(event_link, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // NEW scraping logic using evaluate
                location = await detailPage.evaluate(() => {
                    const venueNameElem = document.querySelector('.tribe-events-single-event-venue__name');
                    const venueAddressElem = document.querySelector('.tribe-events-single-event-address__address');

                    const venueName = venueNameElem ? venueNameElem.innerText.trim() : '';
                    const venueAddress = venueAddressElem ? venueAddressElem.innerText.trim() : '';

                    return venueName || venueAddress || 'PNW Campus';
                });

                console.log('Extracted location:', location); // (optional, for your check)

                await detailPage.close();
            } catch (error) {
                console.error(`❗ Error fetching detail page for event: ${event_name}`, error.message);
            }
        }

        if (event_name && event_date) {
            const checkSql = 'SELECT * FROM events WHERE event_name = ? AND event_date = ?';
            db.query(checkSql, [event_name, event_date], (err, results) => {
                if (err) {
                    console.error('Error checking duplicates:', err);
                } else if (results.length === 0) {
                    const insertSql = 'INSERT INTO events (event_name, abstract, event_date, location) VALUES (?, ?, ?, ?)';
                    db.query(insertSql, [event_name, abstract, event_date, location], (insertErr) => {
                        if (insertErr) console.error('Error inserting event:', insertErr);
                        else console.log(`✅ Inserted event: ${event_name} with location: ${location}`);
                    });
                } else {
                    console.log(`⚠️ Duplicate found, skipping: ${event_name}`);
                }
            });
        }
    }




}

function formatDate(dateString) {
    const parsed = Date.parse(dateString);
    if (!isNaN(parsed)) {
        const d = new Date(parsed);
        return d.toISOString().split('T')[0];
    }
    return null;
}

// Immediate scrape
scrapeEvents();

// Daily cron job scrape
cron.schedule('0 0 * * *', () => {
    scrapeEvents();
    console.log('Scheduled scraping task ran.');
});

module.exports = { scrapeEvents };
