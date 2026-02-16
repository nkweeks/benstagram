import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type }) => {
  const classes = `skeleton ${type}`;
  return <div className={classes}></div>;
};

export const PostSkeleton = () => {
    return (
        <div className="post-skeleton">
            <div className="skeleton-header">
                <Skeleton type="avatar" />
                <Skeleton type="text-short" />
            </div>
            <Skeleton type="image" />
            <div className="skeleton-footer">
                <Skeleton type="text-medium" />
                <Skeleton type="text-long" />
            </div>
        </div>
    )
}

export default Skeleton;
