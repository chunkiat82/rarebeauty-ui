/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';
// import config from '../config';
/* eslint-disable react/no-danger */

class Html extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    styles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        cssText: PropTypes.string.isRequired,
      }).isRequired,
    ),
    scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
    app: PropTypes.object, // eslint-disable-line
    children: PropTypes.string.isRequired,
  };

  static defaultProps = {
    styles: [],
    scripts: [],
  };

  render() {
    const { title, description, styles, scripts, app, children } = this.props;
    return (
      <html className="no-js" lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="google-site-verification"
            content="S0wOAQMshpJMydw4vKy8IQms30yw1FIkzIY6-X6y4oM"
          />
          {scripts.map(script => (
            <link key={script} rel="preload" href={script} as="script" />
          ))}
          {/* <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"/> */}
          {styles.map(style => (
            <style
              key={style.id}
              id={style.id}
              dangerouslySetInnerHTML={{ __html: style.cssText }}
            />
          ))}
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
          <script
            dangerouslySetInnerHTML={{ __html: `window.App=${serialize(app)}` }}
          />
          {scripts.map(script => (
            <script key={script} src={script} />
          ))}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                  WebFontConfig = {
                    google: { families: [ 'Material+Icons' ] }
                  };
                  (function() {
                    var wf = document.createElement('script');
                    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
                      '://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js';
                    wf.type = 'text/javascript';
                    wf.async = 'true';
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(wf, s);
                  })();
                  `,
            }}
          />
          {/* <script
            dangerouslySetInnerHTML={{
              __html: `
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/service-worker.js')
                      .then(function(registration) {
                        console.log('Service Worker registered successfully');
                      })
                      .catch(function(error) {
                        console.log('Service Worker registration failed:', error);
                      })
                  }
                  `,
            }}
          /> */}
        </body>
      </html>
    );
  }
}

export default Html;
