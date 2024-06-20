-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2024-05-11 17:40:44.768

-- tables
-- Table: Country
CREATE TABLE Country (
    id int  NOT NULL IDENTITY(1, 1),
    country_code char(2)  NOT NULL,
    country_name varchar(256)  NOT NULL,
    CONSTRAINT Country_pk PRIMARY KEY  (id)
);

-- Table: POI
CREATE TABLE POI (
    id int  NOT NULL IDENTITY(1, 1),
    TCUser_id varchar(256)  NOT NULL,
    Country_id int  NOT NULL,
    name varchar(50)  NOT NULL,
    latitude int  NOT NULL,
    longitude int  NOT NULL,
    description text  NULL,
    CONSTRAINT POI_pk PRIMARY KEY  (id)
);

-- Table: POIPhoto
CREATE TABLE POIPhoto (
    id int  NOT NULL IDENTITY(1, 1),
    POI_id int  NOT NULL,
    photo varbinary(max)  NOT NULL,
    CONSTRAINT POIPhoto_pk PRIMARY KEY  (id)
);

-- Table: POIType
CREATE TABLE POIType (
    id int  NOT NULL IDENTITY(1, 1),
    name varchar(50)  NOT NULL,
    CONSTRAINT POIType_pk PRIMARY KEY  (id)
);

-- Table: POI_POIType
CREATE TABLE POI_POIType (
    id int  NOT NULL IDENTITY(1, 1),
    POI_id int  NOT NULL,
    POIType_id int  NOT NULL,
    CONSTRAINT POI_POIType_pk PRIMARY KEY  (id)
);

-- Table: PathLevel
CREATE TABLE PathLevel (
    id int  NOT NULL IDENTITY(1, 1),
    name varchar(50)  NOT NULL,
    CONSTRAINT PathLevel_pk PRIMARY KEY  (id)
);

-- Table: PathType
CREATE TABLE PathType (
    id int  NOT NULL IDENTITY(1, 1),
    name varchar(50)  NOT NULL,
    CONSTRAINT PathType_pk PRIMARY KEY  (id)
);

-- Table: Segment
CREATE TABLE Segment (
    id int  NOT NULL IDENTITY(1, 1),
    TCUser_id varchar(256)  NOT NULL,
    Level_id int  NOT NULL,
    Country_id int  NOT NULL,
    name varchar(50)  NOT NULL,
    path_length int  NOT NULL,
    description text  NULL,
    gpx_file varbinary(max)  NOT NULL,
    min_latitude int  NOT NULL,
    max_latitude int  NOT NULL,
    min_longitude int  NOT NULL,
    max_longitude int  NOT NULL,
    CONSTRAINT Segment_pk PRIMARY KEY  (id)
);

-- Table: Segment_POI
CREATE TABLE Segment_POI (
    id int  NOT NULL IDENTITY(1, 1),
    Segment_id int  NOT NULL,
    POI_id int  NOT NULL,
    poi_order int  NOT NULL,
    CONSTRAINT Segment_POI_pk PRIMARY KEY  (id)
);

-- Table: Segment_Type
CREATE TABLE Segment_Type (
    id int  NOT NULL IDENTITY(1, 1),
    PathType_id int  NOT NULL,
    Segment_id int  NOT NULL,
    CONSTRAINT Segment_Type_pk PRIMARY KEY  (id)
);

-- Table: TCUser
CREATE TABLE TCUser (
    id varchar(256)  NOT NULL,
    name varchar(max)  NOT NULL,
    CONSTRAINT TCUser_pk PRIMARY KEY  (id)
);

-- Table: Trail
CREATE TABLE Trail (
    id int  NOT NULL IDENTITY(1, 1),
    TCUser_id varchar(256)  NOT NULL,
    Level_id int  NOT NULL,
    name varchar(50)  NOT NULL,
    total_length int  NOT NULL,
    description text  NULL,
    min_longitude int  NOT NULL,
    max_longitude int  NOT NULL,
    min_latitude int  NOT NULL,
    max_latitude int  NOT NULL,
    CONSTRAINT Trail_pk PRIMARY KEY  (id)
);

-- Table: Trail_Country
CREATE TABLE Trail_Country (
    id int  NOT NULL IDENTITY(1, 1),
    Country_id int  NOT NULL,
    Trail_id int  NOT NULL,
    CONSTRAINT Trail_Country_pk PRIMARY KEY  (id)
);

-- Table: Trail_Segment
CREATE TABLE Trail_Segment (
    id int  NOT NULL IDENTITY(1, 1),
    Trail_id int  NOT NULL,
    Segment_id int  NOT NULL,
    segment_order int  NOT NULL,
    CONSTRAINT Trail_Segment_pk PRIMARY KEY  (id)
);

-- Table: Trail_Type
CREATE TABLE Trail_Type (
    id int  NOT NULL IDENTITY(1, 1),
    PathType_id int  NOT NULL,
    Trail_id int  NOT NULL,
    CONSTRAINT Trail_Type_pk PRIMARY KEY  (id)
);

-- foreign keys
-- Reference: POIPhoto_POI (table: POIPhoto)
ALTER TABLE POIPhoto ADD CONSTRAINT POIPhoto_POI
    FOREIGN KEY (POI_id)
    REFERENCES POI (id);

-- Reference: POI_Country (table: POI)
ALTER TABLE POI ADD CONSTRAINT POI_Country
    FOREIGN KEY (Country_id)
    REFERENCES Country (id);

-- Reference: POI_POIType_POI (table: POI_POIType)
ALTER TABLE POI_POIType ADD CONSTRAINT POI_POIType_POI
    FOREIGN KEY (POI_id)
    REFERENCES POI (id);

-- Reference: POI_POIType_POIType (table: POI_POIType)
ALTER TABLE POI_POIType ADD CONSTRAINT POI_POIType_POIType
    FOREIGN KEY (POIType_id)
    REFERENCES POIType (id);

-- Reference: POI_User (table: POI)
ALTER TABLE POI ADD CONSTRAINT POI_User
    FOREIGN KEY (TCUser_id)
    REFERENCES TCUser (id);

-- Reference: SegmentPOI_POI (table: Segment_POI)
ALTER TABLE Segment_POI ADD CONSTRAINT SegmentPOI_POI
    FOREIGN KEY (POI_id)
    REFERENCES POI (id);

-- Reference: SegmentPOI_Segment (table: Segment_POI)
ALTER TABLE Segment_POI ADD CONSTRAINT SegmentPOI_Segment
    FOREIGN KEY (Segment_id)
    REFERENCES Segment (id);

-- Reference: SegmentType_Type (table: Segment_Type)
ALTER TABLE Segment_Type ADD CONSTRAINT SegmentType_Type
    FOREIGN KEY (PathType_id)
    REFERENCES PathType (id);

-- Reference: Segment_Country (table: Segment)
ALTER TABLE Segment ADD CONSTRAINT Segment_Country
    FOREIGN KEY (Country_id)
    REFERENCES Country (id);

-- Reference: Segment_Level (table: Segment)
ALTER TABLE Segment ADD CONSTRAINT Segment_Level
    FOREIGN KEY (Level_id)
    REFERENCES PathLevel (id);

-- Reference: Segment_Type_Segment (table: Segment_Type)
ALTER TABLE Segment_Type ADD CONSTRAINT Segment_Type_Segment
    FOREIGN KEY (Segment_id)
    REFERENCES Segment (id);

-- Reference: Segment_User (table: Segment)
ALTER TABLE Segment ADD CONSTRAINT Segment_User
    FOREIGN KEY (TCUser_id)
    REFERENCES TCUser (id);

-- Reference: TrailSegment_Segment (table: Trail_Segment)
ALTER TABLE Trail_Segment ADD CONSTRAINT TrailSegment_Segment
    FOREIGN KEY (Segment_id)
    REFERENCES Segment (id);

-- Reference: TrailSegment_Trail (table: Trail_Segment)
ALTER TABLE Trail_Segment ADD CONSTRAINT TrailSegment_Trail
    FOREIGN KEY (Trail_id)
    REFERENCES Trail (id);

-- Reference: TrailType_Type (table: Trail_Type)
ALTER TABLE Trail_Type ADD CONSTRAINT TrailType_Type
    FOREIGN KEY (PathType_id)
    REFERENCES PathType (id);

-- Reference: Trail_Country_Country (table: Trail_Country)
ALTER TABLE Trail_Country ADD CONSTRAINT Trail_Country_Country
    FOREIGN KEY (Country_id)
    REFERENCES Country (id);

-- Reference: Trail_Country_Trail (table: Trail_Country)
ALTER TABLE Trail_Country ADD CONSTRAINT Trail_Country_Trail
    FOREIGN KEY (Trail_id)
    REFERENCES Trail (id);

-- Reference: Trail_Level (table: Trail)
ALTER TABLE Trail ADD CONSTRAINT Trail_Level
    FOREIGN KEY (Level_id)
    REFERENCES PathLevel (id);

-- Reference: Trail_Type_Trail (table: Trail_Type)
ALTER TABLE Trail_Type ADD CONSTRAINT Trail_Type_Trail
    FOREIGN KEY (Trail_id)
    REFERENCES Trail (id);

-- Reference: Trail_User (table: Trail)
ALTER TABLE Trail ADD CONSTRAINT Trail_User
    FOREIGN KEY (TCUser_id)
    REFERENCES TCUser (id);

-- End of file.

