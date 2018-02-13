import React from 'react';
import SelectTags from './SelectTags.jsx';

export default class Research extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            M: '',
            F: '',
            T: '',
            AH: '',
            AB: '',
            AT: '',
            min: '',
            max: '',
            distance: '',
            tags: null,
        };
        this.getTags = this.getTags.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    getTags(tags) {
        this.setState({['tags']: tags});
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
        console.log(this.state);
    }

    render() {
        return (
            <form>
                <br/>Genres :<br/>
                M :<input type="checkbox" name="M" onChange={this.handleChange}/>
                F :<input type="checkbox" name="F" onChange={this.handleChange}/>
                T :<input type="checkbox" name="T" onChange={this.handleChange}/>
                <br/>Attirances :<br/>
                Hetero :<input type="checkbox" name="AH" onChange={this.handleChange}/>
                Bi :<input type="checkbox" name="AB" onChange={this.handleChange}/>
                Trans :<input type="checkbox" name="AT" onChange={this.handleChange}/>
                <br/>Age:<br/>
                minimum :<input type="number" name="min" min="18" max="99" value={this.state.min}
                                onChange={this.handleChange}/>
                maximum :<input type="number" name="max" min="18" max="99" value={this.state.max}
                                onChange={this.handleChange}/>
                <br/>Distance:<br/>
                max distance en km :<input type="number" name="distance" min="0" max="20000"
                                           onChange={this.handleChange}/>
                <input type="checkbox"/>
                <br/>Tags:<br/>
                <SelectTags socket={this.props.socket} sendTags={this.getTags}/>
            </form>
        );
    }
}

