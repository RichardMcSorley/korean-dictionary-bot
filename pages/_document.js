// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <html>
                <Head>
                    <style>{` 

.mui-btn--primary {
    //background-color: hotpink!important;
}
                    .mui-appbar {
                        //background-color: hotpink!important;
                    }
                    body{
       // background: black !important;
    }
    a{
       // color: white;
   // text-decoration: none;
    }`}</style>
                    <meta charSet="utf-8" />
                    <meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=no' />
                    <link href="//cdn.muicss.com/mui-0.9.41/css/mui.css" rel="stylesheet" type="text/css" />
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/4.1.0.rc2/echarts.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
                    <script src="https://duxcharts.oss-cn-beijing.aliyuncs.com/js/echarts-wordcloud.js"></script>
                    <script src="/static/word-cloud.js"></script>
                </Head>
                <body className="custom_class">
                    <Main />
                    <NextScript />
                    
                </body>

            </html>
        )
    }
}