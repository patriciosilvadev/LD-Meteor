import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class MainLayout extends Component {
  componentDidMount() {
    // Use Meteor Blaze to render the consent form
    this.view = Blaze.render(Template.cookieConsentImply,
      ReactDOM.findDOMNode(this.refs.cookieConsentForm));
    setTimeout(function() {
      try {
        Blaze.remove(this.view);
      } catch (e) {
        //
      }
    }, 30000);
  }
  componentWillUnmount() {
    // Clean up Blaze view
    try {
      Blaze.remove(this.view);
    } catch (e) {
      //
    }
  }
  render() {
    return <div>
      <div ref="cookieConsentForm"></div>
      <header>
        {this.props.header}
      </header>
      <main>
        {this.props.content}
      </main>
    </div>
  }
}

export default MainLayout;