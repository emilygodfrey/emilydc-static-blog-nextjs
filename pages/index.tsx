import React from 'react';
import algoliasearch from 'algoliasearch';
import { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { findResultsState } from 'react-instantsearch-dom/server';
import getBlogContentItem from '../common/services/get-blog-content-item.service';
import AlgoliaInstantSearch from '../components/algolia-instant-search/algolia-instant-search';
import HeroBanner from '../components/hero-banner/hero-banner';
import Layout from '../layouts/default';
import useSWR from 'swr';

interface IndexProps {
  title: string;
  subTitle: string;
  buildTimeResultState: unknown;
}

const Index: NextPage<IndexProps> = ({ title, subTitle, buildTimeResultState }): JSX.Element => {
  const seoParams: { [key: string]: string | boolean } = {
    title,
    description: subTitle
  };

  if (process.env.ROBOTS_META_TAG_NOINDEX === 'true') {
    seoParams.noindex = true;
  }

  const searchClient = algoliasearch(
    process.env.ALGOLIA_APPLICATION_ID as string,
    process.env.ALGOLIA_API_KEY as string
  );
  const { data: runtimeResultState } = useSWR('index', () =>
    findResultsState(AlgoliaInstantSearch, {
      searchClient,
      indexName: process.env.ALGOLIA_PRODUCTION_INDEX_NAME as string
    })
  );

  const searchParams = {
    indexName: process.env.ALGOLIA_PRODUCTION_INDEX_NAME as string,
    searchClient,
    resultsState: runtimeResultState || buildTimeResultState
  };

  return (
    <Layout>
      <NextSeo {...seoParams} />
      <HeroBanner title={title} subTitle={subTitle} />
      <>
        <AlgoliaInstantSearch {...searchParams} />
      </>

      <style jsx>{`
        :global(footer) {
          margin-top: 120px;
        }
      `}</style>
    </Layout>
  );
};

Index.getInitialProps = async ({ query }): Promise<IndexProps> => {
  const searchClient = algoliasearch(
    process.env.ALGOLIA_APPLICATION_ID as string,
    process.env.ALGOLIA_API_KEY as string
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const stagingEnvironment = query?.vse ? `//${query.vse.toString()}` : undefined;

  try {
    const blog = await getBlogContentItem(
      process.env.DYNAMIC_CONTENT_BLOG_LIST_DELIVERY_KEY as string,
      stagingEnvironment
    );
    const buildTimeResultState = await findResultsState(AlgoliaInstantSearch, {
      searchClient,
      indexName: process.env.ALGOLIA_PRODUCTION_INDEX_NAME as string
    });

    return { ...blog, buildTimeResultState };
  } catch (err) {
    console.error('Unable to get static props for Index:', err);
    throw err;
  }
};

export default Index;
