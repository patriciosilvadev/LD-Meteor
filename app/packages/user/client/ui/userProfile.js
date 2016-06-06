import React, { Component } from 'react'
import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import debounce from 'lodash/debounce'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Match } from 'meteor/check'

export const UserProfileSchema = new SimpleSchema({
  name: {
    type: String,
    label: 'name',
    max: 600,
    min: 4,
    placeholder: 'name'
  },
  price: {
    type: String,
    label: 'price',
    regEx: /^\$\d+\.\d+$/,
    placeholder: '$0.00',
    min: 2
  }
})

class ValidatedInput extends Component {
  constructor (props) {
    super(props)
    this.state = {validationStarted: false}
    this.componentWillMount.bind(this)
    this.handleChange.bind(this)
  }
  prepareToValidate () {}
  componentWillMount () {
    var startValidation = () => {
      this.setState({
        validationStarted: true
      })
    }
    // if non-blank value: validate now
    if (this.props.value) {
      startValidation()
    } else {
      // wait until the user starts typing, and then stops
      this.prepareToValidate = debounce(startValidation, 1000)
    }
  }
  handleChange (e) {
    if (!this.state.validationStarted) {
      this.prepareToValidate()
    }
    this.props.onChange && this.props.onChange(e)
  }
  render () {
    var className = ''
    if (this.state.validationStarted) {
      className = (this.props.valid ? 'valid' : 'invalid')
    }
    return (
      <input
        {...this.props}
        className={className}
        onChange={(e) => this.handleChange(e)} />
    )
  }
}

class ValidatedForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      price: ''
    }
  }
  handleChange (e) {
    this.setState({
      value: e.target.value
    })
  }
  handlePriceChange (e) {
    this.setState({
      price: e.target.value
    })
  }
  validate (state) {
    return {
      name: Match.test({name: state.value}, this.props.schema.pick(['name'])),
      price: Match.test({price: state.price}, this.props.schema.pick(['price']))
    }
  }
  render () {
    var valid = this.validate(this.state)
    const {schema} = this.props
    return (
      <div>
        <ValidatedInput valid={valid.name}
          className='foobar'
          value={this.state.value}
          onChange={(e) => this.handleChange(e)}
          placeholder={schema._schema.name.placeholder} />
        <ValidatedInput valid={valid.price}
          value={this.state.price}
          onChange={(e) => this.handlePriceChange(e)}
          placeholder={schema._schema.price.placeholder} />
      </div>
    )
  }
}

function onPropsChange (props, onData) {
  const user = Meteor.user()
  onData(null, {user})
}

class UserProfile extends Component {
  render () {
    return (
      <div className='ld-user-profile container-fluid'>
        User Profile
        <ValidatedForm schema={UserProfileSchema} />
      </div>
    )
  }
}

export default composeWithTracker(onPropsChange)(UserProfile)
