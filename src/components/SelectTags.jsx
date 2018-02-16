import React from 'react';
import Select from 'react-select';

export default class SelectTags extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            multi: true,
            multiValue: [],
            options: [],
            value: undefined
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.props.socket.emit("getTags", (tags) => {
            // console.log(tags);
            for (let i in tags) {
                let newt = {value: tags[i].tag_name, label: tags[i].tag_name};
                this.setState({
                    options: [...this.state.options, newt]
                });
            }
        })
    }

    async handleChange(value) {
        const {multi} = this.state;
        if (multi) {
            await this.setState({multiValue: value});
        } else {
            await this.setState({value});
        }
        if (this.props.sendTags)
            await this.props.sendTags(this.state.multiValue);
    }

    render() {
        const {multi, multiValue, options, value} = this.state;
        const AsyncSelect = !this.props.create ? Select : Select.Creatable;

        return (
            <AsyncSelect
                multi={multi}
                options={options}
                onChange={this.handleChange}
                value={multi ? multiValue : value}
            />
        )
    }
}