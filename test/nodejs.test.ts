import { librariesToPackageJson } from '../src';

test('Inline version parsing', () => {
  const packageJson = librariesToPackageJson(['@aws-sdk/client-s3@3.259.0', 'nothing', 'library@v595']);
  expect(packageJson).toMatchObject({
    dependencies: {
      '@aws-sdk/client-s3': '3.259.0',
      'nothing': '*',
      'library': 'v595',
    },
  });
});
