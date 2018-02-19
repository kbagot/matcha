import React from 'react';
import SelectTags from './SelectTags.jsx';

export default class Research extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            M:'',
            F: '',
            T: '',
            hetero: '',
            bi: '',
            trans: '',
            gay: '',
            min: '18',
            max: '99',
            distance: '100',
            tags: [],
            order: {
                age: '',
                distance: '',
                tags: '',
            },
            result: [],
        };
        this.getTags = this.getTags.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    // componentWillUpdate(nextProps, nextState)  //TODO refresh animation  maybe  on this

    // componentDidUpdate(prevProps, prevState) {
    // }

    // refresh() {
    //
    //
    // }

    refresh() {
        this.props.socket.emit('ResearchUsers', this.state, (users) => {
            console.log(users);
            // for (let i in users) {
                this.setState({
                    result: [users]
                    // result: [...this.state.result, users[i].login]  for TODO: scroll
                });
            // }
            console.log(this.state.result);
        });
    }

    getTags(tags) {
        let ptags = tags.map(val => val.value);
        this.setState({['tags']: ptags});
        this.refresh();
    }

    async handleChange(ev) {
        let t = ev.target;

        if (ev.target.type === 'checkbox') {
            this.state[ev.target.name] === '' ? await this.setState({[ev.target.name]: ev.target.name}) : await this.setState({[ev.target.name]: ''});
        } else {
            // if ((t.name === 'min' || t.name === 'max') && (t.value < 18 || t.value > 99)){
            //     if (t.name === 'min')
            //        await this.setState({[ev.target.name]: '18'});
            //     return;
            // }
            await this.setState({[ev.target.name]: ev.target.value});
        }
        this.refresh();
        // console.log(this.state);
        // this.refresh();
    }

    render() {
        return (
            <form>
                <br/>Genres :<br/>
                M :<input type="checkbox" name="M" onChange={this.handleChange}/>
                F :<input type="checkbox" name="F" onChange={this.handleChange}/>
                T :<input type="checkbox" name="T" onChange={this.handleChange}/>
                <br/>Attirances :<br/>
                Hetero :<input type="checkbox" name="hetero" onChange={this.handleChange}/>
                Bi :<input type="checkbox" name="bi" onChange={this.handleChange}/>
                Gay :<input type="checkbox" name="gay" onChange={this.handleChange}/>
                Trans :<input type="checkbox" name="trans" onChange={this.handleChange}/>
                <br/>Age:<br/>
                minimum :<input type="number" name="min" min="18" max="99"
                                onChange={this.handleChange}/>
                maximum :<input type="number" name="max" min="18" max="99"
                                onChange={this.handleChange}/>
                <br/>Distance:<br/>
                max distance en km :<input type="number" name="distance" min="0" max="20000"
                                           onChange={this.handleChange}/>
                <br/>Tags:<br/>
                <SelectTags socket={this.props.socket} sendTags={this.getTags}/>
                <span>{this.state.result}</span>
            </form>
        );
    }
}

