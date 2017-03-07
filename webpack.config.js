module.exports = {
 entry: {
     'build/public/carousel/carousel_swipe': './src/local/carousel/carousel_swipe.ts',
     'build/public/carousel/carousel_original': './src/local/carousel/carousel_original.ts',
     'build/public/drawer/color_test': './src/local/drawer/color_test.ts',
 },
 output: {
   filename: '[name].js',
   path: './'
 },
 module: {
   rules: [
       {
           test: /\.tsx?$/,
           loader: "ts-loader"
       },
     {
       enforce: 'pre',
       test: /\.js$/,
       loader: "source-map-loader"
     },
     {
       enforce: 'pre',
       test: /\.tsx?$/,
       use: "source-map-loader"
     }
   ]
 },
 resolve: {
   extensions: [".ts", ".js"]
 },
 devtool: 'inline-source-map',
};