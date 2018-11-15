import { Component } from 'react'
import fetch from 'isomorphic-unfetch'
let wordCloud = () => { };
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
        body{
            background-color:#36393f;
        }
        #wordcloud_car{
            height: 500px;
        }
        `}</style>
                    <div id="wordcloud_car"></div>
            </main>
        )
    }
}

export default Index