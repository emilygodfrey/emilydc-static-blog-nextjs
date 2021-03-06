import React, { ReactElement } from 'react';
import { BlogJsonLd } from 'next-seo';
import { useRouter } from 'next/router';
import Author from '../../common/interfaces/author.interface';

interface MicrodataProps {
  headline: string;
  description: string;
  imageUrl: string;
  authors: Author[];
  datePublished: string;
}

const Microdata = ({ headline, description, imageUrl, authors = [], datePublished }: MicrodataProps): ReactElement => {
  const router = useRouter();
  const baseUrl = process.env.URL !== undefined ? process.env.URL : '';
  const currentPageUrl = baseUrl + router.asPath;
  const aspectRatios = ['16:9', '4:3', '1:1'];

  return (
    <BlogJsonLd
      url={currentPageUrl}
      description={description}
      title={headline}
      images={[...aspectRatios.map(ratio => `${imageUrl}?w=1200&sm=aspect&aspect=${ratio}`)]}
      authorName={authors.map(author => author.name).join(',')}
      datePublished={datePublished}
      dateModified={datePublished}
    />
  );
};

export default Microdata;
