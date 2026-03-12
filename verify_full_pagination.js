const mongoose = require('mongoose');
const { PromoCode } = require('./src/models');
const { promoCodeService } = require('./src/services');
const config = require('./src/config/config');

const verify = async () => {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  console.log('Connected to MongoDB');

  // Test Pagination Metadata
  const result = await promoCodeService.queryPromoCodes({}, { limit: 2, page: 1 });
  console.log('Result Keys:', Object.keys(result));
  console.log('Results length:', result.results.length);
  console.log('Page:', result.page);
  console.log('Limit:', result.limit);
  console.log('TotalPages:', result.totalPages);
  console.log('TotalResults:', result.totalResults);

  const keys = Object.keys(result);
  const expectedKeys = ['results', 'page', 'limit', 'totalPages', 'totalResults'];
  const allKeysPresent = expectedKeys.every(k => keys.includes(k));

  if (allKeysPresent) {
      console.log('Full Pagination Metadata Verification Success');
  } else {
      console.log('Full Pagination Metadata Verification Failure');
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

verify().catch(console.error);
