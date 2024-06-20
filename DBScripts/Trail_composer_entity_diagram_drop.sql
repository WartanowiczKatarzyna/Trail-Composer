-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2024-03-02 13:15:14.296

-- foreign keys
ALTER TABLE POIPhoto DROP CONSTRAINT POIPhoto_POI;

ALTER TABLE POI DROP CONSTRAINT POI_Country;

ALTER TABLE POI_POIType DROP CONSTRAINT POI_POIType_POI;

ALTER TABLE POI_POIType DROP CONSTRAINT POI_POIType_POIType;

ALTER TABLE Segment_POI DROP CONSTRAINT SegmentPOI_POI;

ALTER TABLE Segment_POI DROP CONSTRAINT SegmentPOI_Segment;

ALTER TABLE Segment_Type DROP CONSTRAINT SegmentType_Type;

ALTER TABLE Segment DROP CONSTRAINT Segment_Country;

ALTER TABLE Segment DROP CONSTRAINT Segment_Level;

ALTER TABLE Segment_Type DROP CONSTRAINT Segment_Type_Segment;

ALTER TABLE Trail_Segment DROP CONSTRAINT TrailSegment_Segment;

ALTER TABLE Trail_Segment DROP CONSTRAINT TrailSegment_Trail;

ALTER TABLE Trail_Type DROP CONSTRAINT TrailType_Type;

ALTER TABLE Trail_Country DROP CONSTRAINT Trail_Country_Country;

ALTER TABLE Trail_Country DROP CONSTRAINT Trail_Country_Trail;

ALTER TABLE Trail DROP CONSTRAINT Trail_Level;

ALTER TABLE Trail_Type DROP CONSTRAINT Trail_Type_Trail;

-- tables
DROP TABLE Country;

DROP TABLE POI;

DROP TABLE POIPhoto;

DROP TABLE POIType;

DROP TABLE POI_POIType;

DROP TABLE PathLevel;

DROP TABLE PathType;

DROP TABLE Segment;

DROP TABLE Segment_POI;

DROP TABLE Segment_Type;

DROP TABLE Trail;

DROP TABLE Trail_Country;

DROP TABLE Trail_Segment;

DROP TABLE Trail_Type;

-- End of file.

