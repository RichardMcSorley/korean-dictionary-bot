import { Component } from 'react'
import fetch from 'isomorphic-unfetch'
import Appbar from 'muicss/lib/react/appbar';
import Button from 'muicss/lib/react/button';
import Container from 'muicss/lib/react/container';
let wordCloud = () => { };
let s1 = { verticalAlign: 'middle' };
let s2 = { textAlign: 'right' };

if (typeof window !== 'undefined') { wordCloud = window.word_cloud }

class Index extends Component {

    state = {
        subscribe: false,
        subscribed: false,
        name: "",
        version: ""
    }

    subscribe = () => {
        if (this.state.subscribe && !this.state.subscribed) {
            // connect to WS server and listen event
            this.props.socket.on('newTerm', () => wordCloud());
            this.setState({ subscribed: true });
        }
    }
    async componentDidMount() {
        const getAppInfo = await fetch('/getAppInfo');
        const app = await getAppInfo.json();
        this.setState({ ...app })
        this.subscribe()
        wordCloud()
    }

    componentDidUpdate() {
        this.subscribe()
    }

    static getDerivedStateFromProps(props, state) {
        if (props.socket && !state.subscribe) return { subscribe: true }
        return null
    }

    // close socket connection
    componentWillUnmount() {
        this.props.socket.off('newTerm', console.log('disconnected'))
    }



    render() {
        return (
            <main>
                                <style>{`
        #wordcloud_car{
            height: 600px;
        }
        .link-wrapper{
            display: flex;
            justify-content: space-around;
        }`}</style>
                <Appbar>
                    <table width="100%">
                        <tbody>
                            <tr style={s1}>
                                <td className="mui--appbar-height" style={{paddingLeft: 15, fontWeight: 'bold'}}>{this.state.name} v{this.state.version}</td>
                                <td className="mui--appbar-height" style={s2}></td>
                            </tr>
                        </tbody>
                    </table>
                </Appbar>
                <Container>


                    <div id="wordcloud_car"></div>
                    <div className="link-wrapper">
                        <Button color="primary" onClick={() => {if(confirm('Are you sure you want to erase all the data?')){fetch('/reset/terms')}}}>Reset</Button>
                        <Button color="primary" onClick={() => wordCloud()}>Refresh</Button>

                    </div>
                </Container>



            </main>
        )
    }
}

export default Index