import CONFIG_NOBELIUM from './config_nobelium'
import CommonHead from '@/components/CommonHead'
import React, { useEffect, useState } from 'react'
import Nav from './components/Nav'
import { Footer } from './components/Footer'
import JumpToTopButton from './components/JumpToTopButton'
import Live2D from '@/components/Live2D'
import { useGlobal } from '@/lib/global'

import BLOG from '@/blog.config'
import Announcement from './components/Announcement'
import { BlogListPage } from './components/BlogListPage'
import { BlogListScroll } from './components/BlogListScroll'

import { useRouter } from 'next/router'

import Mark from 'mark.js'
import { deepClone, isBrowser } from '@/lib/utils'
import SearchNavBar from './components/SearchNavBar'
import BlogArchiveItem from './components/BlogArchiveItem'

import { ArticleLock } from './components/ArticleLock'
import NotionPage from '@/components/NotionPage'
import { ArticleInfo } from './components/ArticleInfo'
import Comment from '@/components/Comment'
import { ArticleFooter } from './components/ArticleFooter'
import ShareBar from '@/components/ShareBar'

import Link from 'next/link'
import BlogListBar from './components/BlogListBar'

/**
 * 基础布局 采用左右两侧布局，移动端使用顶部导航栏

 * @returns {JSX.Element}
 * @constructor
 */
const LayoutBase = props => {
  const { children, meta, post, topSlot } = props

  const fullWidth = post?.fullWidth ?? false
  const { onLoading } = useGlobal()

  const LoadingCover = <div id='cover-loading' className={`${onLoading ? 'z-50 opacity-50' : '-z-10 opacity-0'} pointer-events-none transition-all duration-300`}>
        <div className='w-full h-screen flex justify-center items-center'>
            <i className="fa-solid fa-spinner text-2xl text-black dark:text-white animate-spin">  </i>
        </div>
    </div>
  return (
        <div id='theme-nobelium' className='nobelium relative dark:text-gray-300  w-full  bg-white dark:bg-black min-h-screen'>
            {/* SEO相关 */}
            <CommonHead meta={meta} />

            {/* 顶部导航栏 */}
            <Nav {...props} />

            {/* 主区 */}
            <main id='out-wrapper' className={`relative m-auto flex-grow w-full transition-all ${!fullWidth ? 'max-w-2xl px-4' : 'px-4 md:px-24'}`}>
                {/* 顶部插槽 */}
                {topSlot}

                {onLoading ? LoadingCover : children}

            </main>

            {/* 页脚 */}
            <Footer {...props} />

            {/* 右下悬浮 */}
            <div className='fixed right-4 bottom-4'>
                <JumpToTopButton />
            </div>

            {/* 左下悬浮 */}
            <div className="bottom-4 -left-14 fixed justify-end z-40">
                <Live2D />
            </div>
        </div>
  )
}

/**
 * 首页
 * 首页是个博客列表，加上顶部嵌入一个公告
 * @param {*} props
 * @returns
 */
const LayoutIndex = props => {
  return (
        <LayoutPostList {...props} topSlot={<Announcement {...props} />} />
  )
}

/**
 * 博客列表
 * @param {*} props
 * @returns
 */
const LayoutPostList = props => {
  const { posts } = props

  // 在列表中进行实时过滤
  const [filterKey, setFilterKey] = useState('')
  let filteredBlogPosts = []
  if (filterKey && posts) {
    filteredBlogPosts = posts.filter(post => {
      const tagContent = post.tags ? post.tags.join(' ') : ''
      const searchContent = post.title + post.summary + tagContent
      return searchContent.toLowerCase().includes(filterKey.toLowerCase())
    })
  } else {
    filteredBlogPosts = deepClone(posts)
  }

  return (
        <LayoutBase {...props} topSlot={<BlogListBar {...props} setFilterKey={setFilterKey} />}>
            {BLOG.POST_LIST_STYLE === 'page' ? <BlogListPage {...props} posts={filteredBlogPosts}/> : <BlogListScroll {...props} posts={filteredBlogPosts}/>}
        </LayoutBase>
  )
}

/**
 * 搜索
 * 页面是博客列表，上方嵌入一个搜索引导条
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      const container = isBrowser() && document.getElementById('posts-wrapper')
      if (container && container.innerHTML) {
        const re = new RegExp(keyword, 'gim')
        const instance = new Mark(container)
        instance.markRegExp(re, {
          element: 'span',
          className: 'text-red-500 border-b border-dashed'
        })
      }
    }, 100)
  }, [router.events])

  return <LayoutPostList {...props} slotTop={<SearchNavBar {...props} />} />
}

/**
 * 归档
 * @param {*} props
 * @returns
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  return (
        <LayoutBase {...props}>
            <div className="mb-10 pb-20 md:py-12 p-3  min-h-screen w-full">
                {Object.keys(archivePosts).map(archiveTitle => <BlogArchiveItem key={archiveTitle} archiveTitle={archiveTitle} archivePosts={archivePosts} />)}
            </div>
        </LayoutBase>
  )
}

/**
 * 文章详情
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props

  return (
        <LayoutBase {...props}>

            {lock && <ArticleLock validPassword={validPassword} />}

            {!lock && <div id="article-wrapper" className="px-2">
                <>
                    <ArticleInfo post={post} />
                    <NotionPage post={post} />
                    <ShareBar post={post} />
                    <Comment frontMatter={post} />
                    <ArticleFooter />
                </>
            </div>}

        </LayoutBase>
  )
}

/**
 * 404 页面
 * @param {*} props
 * @returns
 */
const Layout404 = (props) => {
  return <LayoutBase {...props}>
        404 Not found.
    </LayoutBase>
}

/**
 * 文章分类列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = (props) => {
  const { categoryOptions } = props

  return (
        <LayoutBase {...props}>
            <div id='category-list' className='duration-200 flex flex-wrap'>
                {categoryOptions?.map(category => {
                  return (
                        <Link
                            key={category.name}
                            href={`/category/${category.name}`}
                            passHref
                            legacyBehavior>
                            <div
                                className={'hover:text-black dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600 px-5 cursor-pointer py-2 hover:bg-gray-100'}>
                                <i className='mr-4 fas fa-folder' />{category.name}({category.count})
                            </div>
                        </Link>
                  )
                })}
            </div>
        </LayoutBase>
  )
}

/**
 * 文章标签列表
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = (props) => {
  const { tagOptions } = props
  return (
        <LayoutBase {...props}>
            <div>
                <div id='tags-list' className='duration-200 flex flex-wrap'>
                    {tagOptions.map(tag => {
                      return (
                            <div key={tag.name} className='p-2'>
                                <Link key={tag} href={`/tag/${encodeURIComponent(tag.name)}`} passHref
                                    className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200 mr-2 py-1 px-2 text-xs whitespace-nowrap dark:hover:text-white text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}>
                                    <div className='font-light dark:text-gray-400'><i className='mr-1 fas fa-tag' /> {tag.name + (tag.count ? `(${tag.count})` : '')} </div>
                                </Link>
                            </div>
                      )
                    })}
                </div>
            </div>
        </LayoutBase>
  )
}

export {
  CONFIG_NOBELIUM as THEME_CONFIG,
  LayoutIndex,
  LayoutSearch,
  LayoutArchive,
  LayoutSlug,
  Layout404,
  LayoutPostList,
  LayoutCategoryIndex,
  LayoutTagIndex
}
