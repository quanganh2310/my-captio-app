import { DefaultFooter, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link, SelectLang, useIntl, connect, FormattedMessage } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import React from 'react';
import logo from '../assets/logo.svg';
import styles from './UserLayout.less';

const UserLayout = (props) => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { formatMessage } = useIntl();
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    formatMessage,
    breadcrumb,
    ...props,
  });

  const defaultFooterDom = (
    <DefaultFooter
      copyright={`${new Date().getFullYear()} Hanoi University of Science and Technology HEDSPI K61`}
      links={[
        {
          key: 'Ant Design Pro',
          title: 'Ant Design Pro',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
        {
          key: 'Github Source',
          title: <GithubOutlined />,
          href: 'https://github.com/quanganh2310/my-captio-app',
          blankTarget: true,
        },
        {
          key: 'IBM Watson Speech',
          title: 'IBM Watson Speech',
          href: 'https://www.ibm.com/cloud/watson-speech-to-text',
          blankTarget: true,
        },
      ]}
    />
  );

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>Captio</span>
              </Link>
            </div>
            <div className={styles.desc}>
               Make any streaming video and meeting become smooth
              {/* <FormattedMessage
                id="pages.layouts.userLayout.title"
                defaultMessage="Ant Design 是西湖区最具影响力的 Web 设计规范"
              >Captio</FormattedMessage> */}
            </div>
          </div>
          {children}
        </div>
        {defaultFooterDom}
      </div>
    </HelmetProvider>
  );
};

export default connect(({ settings }) => ({ ...settings }))(UserLayout);
