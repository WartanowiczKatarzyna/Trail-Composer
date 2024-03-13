using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Trail_Composer.Models.Generated;

namespace Trail_Composer.Data;

public partial class TrailComposerDbContext : DbContext
{
    public TrailComposerDbContext()
    {
    }

    public TrailComposerDbContext(DbContextOptions<TrailComposerDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Country> Countries { get; set; }

    public virtual DbSet<PathLevel> PathLevels { get; set; }

    public virtual DbSet<PathType> PathTypes { get; set; }

    public virtual DbSet<Poi> Pois { get; set; }

    public virtual DbSet<PoiPoitype> PoiPoitypes { get; set; }

    public virtual DbSet<Poiphoto> Poiphotos { get; set; }

    public virtual DbSet<Poitype> Poitypes { get; set; }

    public virtual DbSet<Segment> Segments { get; set; }

    public virtual DbSet<SegmentPoi> SegmentPois { get; set; }

    public virtual DbSet<SegmentType> SegmentTypes { get; set; }

    public virtual DbSet<Tcuser> Tcusers { get; set; }

    public virtual DbSet<Trail> Trails { get; set; }

    public virtual DbSet<TrailCountry> TrailCountries { get; set; }

    public virtual DbSet<TrailSegment> TrailSegments { get; set; }

    public virtual DbSet<TrailType> TrailTypes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost\\MSSQLSERVER01; Database=Trail_Composer_DB; trusted_connection=true; encrypt=false;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Country>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Country_pk");

            entity.ToTable("Country");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CountryCode)
                .HasMaxLength(2)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("country_code");
            entity.Property(e => e.CountryName)
                .HasMaxLength(256)
                .IsUnicode(false)
                .HasColumnName("country_name");
        });

        modelBuilder.Entity<PathLevel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PathLevel_pk");

            entity.ToTable("PathLevel");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<PathType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PathType_pk");

            entity.ToTable("PathType");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Poi>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("POI_pk");

            entity.ToTable("POI");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CountryId).HasColumnName("Country_id");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.Latitude)
                .HasColumnType("decimal(10, 6)")
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasColumnType("decimal(10, 6)")
                .HasColumnName("longitude");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.TcuserId)
                .HasMaxLength(256)
                .IsUnicode(false)
                .HasColumnName("TCUser_id");

            entity.HasOne(d => d.Country).WithMany(p => p.Pois)
                .HasForeignKey(d => d.CountryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("POI_Country");

            entity.HasOne(d => d.Tcuser).WithMany(p => p.Pois)
                .HasForeignKey(d => d.TcuserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("POI_User");
        });

        modelBuilder.Entity<PoiPoitype>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("POI_POIType_pk");

            entity.ToTable("POI_POIType");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PoiId).HasColumnName("POI_id");
            entity.Property(e => e.PoitypeId).HasColumnName("POIType_id");

            entity.HasOne(d => d.Poi).WithMany(p => p.PoiPoitypes)
                .HasForeignKey(d => d.PoiId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("POI_POIType_POI");

            entity.HasOne(d => d.Poitype).WithMany(p => p.PoiPoitypes)
                .HasForeignKey(d => d.PoitypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("POI_POIType_POIType");
        });

        modelBuilder.Entity<Poiphoto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("POIPhoto_pk");

            entity.ToTable("POIPhoto");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Photo).HasColumnName("photo");
            entity.Property(e => e.PoiId).HasColumnName("POI_id");

            entity.HasOne(d => d.Poi).WithMany(p => p.Poiphotos)
                .HasForeignKey(d => d.PoiId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("POIPhoto_POI");
        });

        modelBuilder.Entity<Poitype>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("POIType_pk");

            entity.ToTable("POIType");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Segment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Segment_pk");

            entity.ToTable("Segment");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CountryId).HasColumnName("Country_id");
            entity.Property(e => e.Desciption)
                .HasColumnType("text")
                .HasColumnName("desciption");
            entity.Property(e => e.GpxFile)
                .HasColumnType("xml")
                .HasColumnName("gpx_file");
            entity.Property(e => e.Length).HasColumnName("length");
            entity.Property(e => e.LevelId).HasColumnName("Level_id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.TcuserId)
                .HasMaxLength(256)
                .IsUnicode(false)
                .HasColumnName("TCUser_id");

            entity.HasOne(d => d.Country).WithMany(p => p.Segments)
                .HasForeignKey(d => d.CountryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Segment_Country");

            entity.HasOne(d => d.Level).WithMany(p => p.Segments)
                .HasForeignKey(d => d.LevelId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Segment_Level");

            entity.HasOne(d => d.Tcuser).WithMany(p => p.Segments)
                .HasForeignKey(d => d.TcuserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Segment_User");
        });

        modelBuilder.Entity<SegmentPoi>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Segment_POI_pk");

            entity.ToTable("Segment_POI");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PoiId).HasColumnName("POI_id");
            entity.Property(e => e.PoiOrder).HasColumnName("poi_order");
            entity.Property(e => e.SegmentId).HasColumnName("Segment_id");

            entity.HasOne(d => d.Poi).WithMany(p => p.SegmentPois)
                .HasForeignKey(d => d.PoiId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("SegmentPOI_POI");

            entity.HasOne(d => d.Segment).WithMany(p => p.SegmentPois)
                .HasForeignKey(d => d.SegmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("SegmentPOI_Segment");
        });

        modelBuilder.Entity<SegmentType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Segment_Type_pk");

            entity.ToTable("Segment_Type");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PathTypeId).HasColumnName("PathType_id");
            entity.Property(e => e.SegmentId).HasColumnName("Segment_id");

            entity.HasOne(d => d.PathType).WithMany(p => p.SegmentTypes)
                .HasForeignKey(d => d.PathTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("SegmentType_Type");

            entity.HasOne(d => d.Segment).WithMany(p => p.SegmentTypes)
                .HasForeignKey(d => d.SegmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Segment_Type_Segment");
        });

        modelBuilder.Entity<Tcuser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TCUser_pk");

            entity.ToTable("TCUser");

            entity.Property(e => e.Id)
                .HasMaxLength(256)
                .IsUnicode(false)
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Trail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Trail_pk");

            entity.ToTable("Trail");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.LevelId).HasColumnName("Level_id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.TcuserId)
                .HasMaxLength(256)
                .IsUnicode(false)
                .HasColumnName("TCUser_id");
            entity.Property(e => e.TotalLength).HasColumnName("total_length");

            entity.HasOne(d => d.Level).WithMany(p => p.Trails)
                .HasForeignKey(d => d.LevelId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Trail_Level");

            entity.HasOne(d => d.Tcuser).WithMany(p => p.Trails)
                .HasForeignKey(d => d.TcuserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Trail_User");
        });

        modelBuilder.Entity<TrailCountry>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Trail_Country_pk");

            entity.ToTable("Trail_Country");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CountryId).HasColumnName("Country_id");
            entity.Property(e => e.TrailId).HasColumnName("Trail_id");

            entity.HasOne(d => d.Country).WithMany(p => p.TrailCountries)
                .HasForeignKey(d => d.CountryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Trail_Country_Country");

            entity.HasOne(d => d.Trail).WithMany(p => p.TrailCountries)
                .HasForeignKey(d => d.TrailId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Trail_Country_Trail");
        });

        modelBuilder.Entity<TrailSegment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Trail_Segment_pk");

            entity.ToTable("Trail_Segment");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SegmentId).HasColumnName("Segment_id");
            entity.Property(e => e.SegmentOrder).HasColumnName("segment_order");
            entity.Property(e => e.TrailId).HasColumnName("Trail_id");

            entity.HasOne(d => d.Segment).WithMany(p => p.TrailSegments)
                .HasForeignKey(d => d.SegmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("TrailSegment_Segment");

            entity.HasOne(d => d.Trail).WithMany(p => p.TrailSegments)
                .HasForeignKey(d => d.TrailId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("TrailSegment_Trail");
        });

        modelBuilder.Entity<TrailType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Trail_Type_pk");

            entity.ToTable("Trail_Type");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PathTypeId).HasColumnName("PathType_id");
            entity.Property(e => e.TrailId).HasColumnName("Trail_id");

            entity.HasOne(d => d.PathType).WithMany(p => p.TrailTypes)
                .HasForeignKey(d => d.PathTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("TrailType_Type");

            entity.HasOne(d => d.Trail).WithMany(p => p.TrailTypes)
                .HasForeignKey(d => d.TrailId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Trail_Type_Trail");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
