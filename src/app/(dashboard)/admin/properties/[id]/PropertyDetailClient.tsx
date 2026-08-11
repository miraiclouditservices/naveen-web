"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/utils/api";

export default function PropertyDetailClient({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<any>(null);
  const [floors, setFloors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(property?.images) && property.images.length > 0) {
      property.images.forEach((img: any) => {
        const u = typeof img === "string" ? img : img?.imageUrl || img?.url;
        if (u && typeof u === "string" && u.trim() !== "") list.push(u);
      });
    }
    if (typeof property?.imageUrl === "string" && property.imageUrl.trim() !== "" && !list.includes(property.imageUrl)) {
      list.unshift(property.imageUrl);
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80");
    }
    return list;
  }, [property]);

  const parseFloorNum = (numStr: string) => {
    if (!numStr) return 0;
    if (numStr.toLowerCase().includes("ground")) return 0;
    const match = numStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const fetchPropertyAndFloors = async () => {
    setIsLoading(true);
    try {
      const [propRes, floorRes] = await Promise.all([
        api.get(`/properties/${propertyId}`),
        api.get(`/floors?property=${propertyId}&limit=100`)
      ]);

      if (propRes.success) {
        setProperty(propRes.data);
      }

      if (floorRes.success && floorRes.data && floorRes.data.length > 0) {
        const sortedFloors = [...floorRes.data].sort((a, b) => {
          return parseFloorNum(a.floorNumber) - parseFloorNum(b.floorNumber);
        });
        setFloors(sortedFloors);
      } else {
        // Dynamic fallback generated floors if backend returns no floor records yet
        const totalFloors = propRes.data?.totalFloors || 0;
        const totalSft = propRes.data?.totalSft || 0;
        const estimatedSft = totalFloors > 0 ? Math.round(totalSft / totalFloors) : 0;

        const generatedFloors: any[] = [];
        if (totalFloors > 0) {
          generatedFloors.push({
            floorNumber: "Ground Floor",
            floorName: "Main Lobby Floor",
            totalSft: estimatedSft,
            occupiedSft: 0,
            availableSft: estimatedSft,
            floorRevenue: 0,
            occupancyStatus: "Vacant",
            occupiedBy: "Vacant",
            occupants: []
          });
          for (let i = 1; i < totalFloors; i++) {
            generatedFloors.push({
              floorNumber: `${i}${i === 1 ? "st" : i === 2 ? "nd" : i === 3 ? "rd" : "th"} Floor`,
              floorName: `Floor ${i}`,
              totalSft: estimatedSft,
              occupiedSft: 0,
              availableSft: estimatedSft,
              floorRevenue: 0,
              occupancyStatus: "Vacant",
              occupiedBy: "Vacant",
              occupants: []
            });
          }
        }
        setFloors(generatedFloors);
      }
    } catch (err) {
      console.error("Failed to fetch property details or floors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId && propertyId !== "new" && propertyId !== "fallback") {
      fetchPropertyAndFloors();
    } else {
      setIsLoading(false);
    }
  }, [propertyId]);


  // Metric Computations (strict backend data, no hardcoded defaults)
  const totalArea = property?.totalSft || 0;
  const occupiedArea = property?.occupiedSft ?? 0;
  const availableArea = property?.availableSft ?? Math.max(0, totalArea - occupiedArea);
  const occRate = property?.occupancyPercentage ?? property?.occupancy ?? (totalArea > 0 ? Math.round((occupiedArea / totalArea) * 100) : 0);
  const availRate = 100 - occRate;
  const monthlyRevenue = property?.monthlyRevenue ?? 0;
  const totalFloorsCount = property?.totalFloors ?? floors.length ?? 0;
  const totalUnitsCount = property?.totalUnits ?? 0;

  // Skeleton Loader
  if (isLoading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-3" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div className="placeholder-glow">
          <div className="placeholder col-3 mb-3 rounded py-2"></div>
          <div className="placeholder col-12 mb-4 rounded py-5"></div>
          <div className="row g-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-3">
                <div className="placeholder col-12 rounded py-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-3" style={{ maxWidth: "1280px", margin: "0 auto", color: "#1e293b" }}>

      {/* 1. Top Bar Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <Link
          href="/admin/properties"
          className="text-decoration-none d-inline-flex align-items-center gap-1 fw-medium"
          style={{ color: "#475569", fontSize: "0.9rem" }}
        >
          <i className="bi bi-chevron-left" style={{ fontSize: "0.8rem" }}></i> Back to Properties
        </Link>
      </div>

      {/* 2. Hero Property Banner Card */}
      <div
        className="p-4 rounded-4 mb-4 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #b43a05 0%, #7c2202 100%)",
          borderRadius: "16px"
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.25)"
            }}
          >
            <i className="bi bi-buildings-fill text-white" style={{ fontSize: "1.8rem" }}></i>
          </div>

          <div>
            <h2 className="fw-bold mb-1" style={{ fontSize: "1.6rem", letterSpacing: "-0.01em" }}>
              {property?.propertyName || "Green Valley Commercial Hub"}
            </h2>
            <div className="d-flex align-items-center gap-1.5 opacity-90" style={{ fontSize: "0.88rem" }}>
              <i className="bi bi-geo-alt-fill" style={{ fontSize: "0.95rem" }}></i>
              <span>{property?.propertyAddress || "Gachibowli Main Road, Gachibowli, Hyderabad, Telangana - 500046"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Key Metrics Cards Row (4 Grid Cards) */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Area */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bg-white border rounded-3 p-3 h-100 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-2"
                style={{ width: "32px", height: "32px", backgroundColor: "#ffedd5", color: "#ea580c" }}
              >
                <i className="bi bi-arrows-angle-expand" style={{ fontSize: "1rem" }}></i>
              </div>
              <span className="text-muted fw-medium" style={{ fontSize: "0.82rem" }}>Total Area</span>
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: "1.35rem", color: "#0f172a" }}>
              {totalArea.toLocaleString()} sft
            </div>
            <div className="text-muted" style={{ fontSize: "0.78rem" }}>
              Occ: {occupiedArea.toLocaleString()} | Avail: {availableArea.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 2: Occupancy Rate */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bg-white border rounded-3 p-3 h-100 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-2"
                style={{ width: "32px", height: "32px", backgroundColor: "#e0f2fe", color: "#0284c7" }}
              >
                <i className="bi bi-clock-history" style={{ fontSize: "1rem" }}></i>
              </div>
              <span className="text-muted fw-medium" style={{ fontSize: "0.82rem" }}>Occupancy Rate</span>
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: "1.35rem", color: "#0f172a" }}>
              {occRate}%
            </div>
            <div className="progress mb-1" style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${occRate}%`, backgroundColor: "#0284c7", borderRadius: "10px" }}
              ></div>
            </div>
            <div className="text-muted" style={{ fontSize: "0.78rem" }}>
              Ready
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bg-white border rounded-3 p-3 h-100 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-2"
                style={{ width: "32px", height: "32px", backgroundColor: "#dcfce7", color: "#16a34a" }}
              >
                <i className="bi bi-[#16a34a]" style={{ fontSize: "1rem" }}>
                  ₹
                </i>
              </div>
              <span className="text-muted fw-medium" style={{ fontSize: "0.82rem" }}>Monthly Revenue</span>
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: "1.35rem", color: "#0f172a" }}>
              ₹{monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-muted" style={{ fontSize: "0.78rem" }}>
              Est. Monthly Total
            </div>
          </div>
        </div>

        {/* Card 4: Floors & Units */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bg-white border rounded-3 p-3 h-100 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-2"
                style={{ width: "32px", height: "32px", backgroundColor: "#ffedd5", color: "#ea580c" }}
              >
                <i className="bi bi-building" style={{ fontSize: "1rem" }}></i>
              </div>
              <span className="text-muted fw-medium" style={{ fontSize: "0.82rem" }}>Floors & Units</span>
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: "1.35rem", color: "#0f172a" }}>
              {totalFloorsCount} Floors
            </div>
            <div className="text-muted" style={{ fontSize: "0.78rem" }}>
              {totalUnitsCount} Units
            </div>
          </div>
        </div>
      </div>

      {/* 4. Occupancy & Space Allocation Banner */}
      <div className="bg-white border rounded-3 p-3 p-md-4 mb-4 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-clock-history" style={{ color: "#ea580c", fontSize: "1.1rem" }}></i>
            <h5 className="fw-bold mb-0" style={{ fontSize: "1rem", color: "#0f172a" }}>
              Occupancy & Space Allocation
            </h5>
          </div>
          <span
            className="badge rounded-pill fw-semibold px-3 py-1.5"
            style={{ backgroundColor: "#dcfce7", color: "#15803d", fontSize: "0.78rem" }}
          >
            {property?.status || "Active"}
          </span>
        </div>

        {/* Space Allocation Bar */}
        <div className="progress mb-3" style={{ height: "10px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${occRate}%`, backgroundColor: "#22c55e", borderRadius: "10px" }}
          ></div>
        </div>

        {/* 3 Metric Sub-columns */}
        <div className="row text-start g-3 pt-1">
          <div className="col-12 col-md-4 border-end-md">
            <div className="text-muted fw-medium mb-1" style={{ fontSize: "0.8rem" }}>Occupied Area</div>
            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#0f172a" }}>
              {occupiedArea.toLocaleString()} sft{" "}
              <span style={{ color: "#16a34a", fontSize: "0.95rem" }}>({occRate}%)</span>
            </div>
          </div>

          <div className="col-12 col-md-4 border-end-md">
            <div className="text-muted fw-medium mb-1" style={{ fontSize: "0.8rem" }}>Available Area</div>
            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#0f172a" }}>
              {availableArea.toLocaleString()} sft{" "}
              <span style={{ color: "#ea580c", fontSize: "0.95rem" }}>({availRate}%)</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="text-muted fw-medium mb-1" style={{ fontSize: "0.8rem" }}>Total Property</div>
            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#0f172a" }}>
              {totalArea.toLocaleString()} sft{" "}
              <span style={{ color: "#64748b", fontSize: "0.95rem" }}>(100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Additional Property Information Card */}
      <div className="bg-white border rounded-3 p-3 p-md-4 mb-4 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: "1.05rem", color: "#0f172a" }}>
          <i className="bi bi-info-circle-fill" style={{ color: "#ea580c" }}></i> Property Specifications & Details
        </h5>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 h-100 border" style={{ borderColor: "#f1f5f9" }}>
              <span className="text-muted extra-small d-block mb-1">Property Code & Type</span>
              <strong className="text-dark d-block mb-1" style={{ fontSize: "0.95rem" }}>{property?.propertyCode || "N/A"}</strong>
              <span className="badge bg-dark text-white extra-small">{property?.propertyType || "Commercial"}</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 h-100 border" style={{ borderColor: "#f1f5f9" }}>
              <span className="text-muted extra-small d-block mb-1">Locality & Landmark</span>
              <strong className="text-dark d-block mb-1" style={{ fontSize: "0.95rem" }}>{property?.locality || property?.city || "N/A"}</strong>
              <span className="text-muted extra-small">{property?.landmark ? `Landmark: ${property.landmark}` : property?.pincode ? `Pincode: ${property.pincode}` : ""}</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 h-100 border" style={{ borderColor: "#f1f5f9" }}>
              <span className="text-muted extra-small d-block mb-1">Emergency Contact</span>
              <strong className="text-dark d-block mb-1" style={{ fontSize: "0.95rem" }}>{property?.emergencyContactName || "Facility Manager"}</strong>
              <span className="text-muted extra-small"><i className="bi bi-telephone me-1"></i>{property?.emergencyContactNumber || property?.email || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Website & Maps */}
        {(property?.website || property?.googleMapUrl || property?.email) && (
          <div className="d-flex flex-wrap align-items-center gap-3 pt-3 mt-3 border-top" style={{ borderColor: "#f1f5f9", fontSize: "0.83rem" }}>
            {property?.email && (
              <span className="text-muted">
                <i className="bi bi-envelope me-1 text-primary"></i>
                <a href={`mailto:${property.email}`} className="text-decoration-none text-dark fw-medium">{property.email}</a>
              </span>
            )}
            {property?.website && (
              <span className="text-muted">
                <i className="bi bi-globe me-1 text-success"></i>
                <a href={property.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-success fw-medium">Official Website</a>
              </span>
            )}
            {property?.googleMapUrl && (
              <span className="text-muted">
                <i className="bi bi-map me-1 text-danger"></i>
                <a href={property.googleMapUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-danger fw-medium">View on Google Maps</a>
              </span>
            )}
          </div>
        )}

        {/* Active Amenities Badges */}
        {property?.amenities && (
          <div className="pt-3 mt-3 border-top" style={{ borderColor: "#f1f5f9" }}>
            <span className="text-muted extra-small d-block mb-3 fw-bold uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.04em", color: "#64748b" }}>
              Available Amenities ({Object.values(property.amenities).filter(Boolean).length}):
            </span>
            <div className="d-flex flex-wrap" style={{ gap: "10px 12px" }}>
              {Object.entries(property.amenities)
                .filter(([_, value]) => value === true)
                .map(([key]) => {
                  let formatted = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  if (key === 'cctv') formatted = 'CCTV';
                  if (key === 'atm') formatted = 'ATM';
                  if (key === 'evCharging') formatted = 'EV Charging';

                  return (
                    <div
                      key={key}
                      className="d-inline-flex align-items-center rounded-pill px-3 py-1.5 border shadow-2xs"
                      style={{
                        backgroundColor: "#ecfdf5",
                        borderColor: "#a7f3d0",
                        color: "#065f46",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        lineHeight: 1.2
                      }}
                    >
                      <i className="bi bi-check-circle-fill me-2" style={{ color: "#10b981", fontSize: "0.85rem" }}></i>
                      <span>{formatted}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* 6. Property Gallery Card Section */}
      {galleryImages.length > 0 && (
        <div className="bg-white border rounded-3 p-3 p-md-4 mb-4 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
          <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: "1.05rem", color: "#0f172a" }}>
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-images" style={{ color: "#ea580c" }}></i> Property Gallery ({galleryImages.length})
            </span>
            <span className="extra-small text-muted fw-normal">Click any photo to enlarge</span>
          </h5>

          <div className="row g-3">
            {galleryImages.map((imgUrl, idx) => (
              <div key={idx} className="col-6 col-sm-4 col-md-3">
                <div
                  className="rounded-3 overflow-hidden border shadow-xs position-relative cursor-pointer group mkt-card-clean"
                  style={{
                    borderRadius: "14px",
                    borderColor: "#e2e8f0",
                    height: "150px",
                    backgroundColor: "#f8fafc"
                  }}
                  onClick={() => setPreviewImageModal(imgUrl)}
                >
                  <img
                    src={imgUrl}
                    alt={`Property Photo ${idx + 1}`}
                    className="w-100 h-100 object-fit-cover transition-all"
                    style={{ transition: "transform 0.4s ease" }}
                  />
                  <div
                    className="position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 opacity-0 hover-opacity-100 transition-all"
                    style={{ transition: "opacity 0.2s ease" }}
                  >
                    <span className="badge bg-white text-dark fw-bold shadow-sm px-2.5 py-1.5 extra-small rounded-pill">
                      <i className="bi bi-zoom-in me-1 text-orange"></i> Preview
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Preview Image Modal */}
      {previewImageModal && (
        <>
          <div
            className="position-fixed inset-0 bg-dark bg-opacity-75"
            style={{ zIndex: 1065, backdropFilter: "blur(4px)" }}
            onClick={() => setPreviewImageModal(null)}
          />
          <div
            className="position-fixed top-50 start-50 translate-middle p-2 bg-white rounded-4 shadow-lg animate-fade-up"
            style={{ zIndex: 1070, maxWidth: "min(90vw, 850px)", maxHeight: "90vh" }}
          >
            <div className="position-relative">
              <button
                className="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-2 shadow-sm"
                style={{ width: 32, height: 32, zIndex: 10, lineHeight: 1 }}
                onClick={() => setPreviewImageModal(null)}
              >
                ✕
              </button>
              <img
                src={previewImageModal}
                alt="Enlarged Property Photo"
                className="img-fluid rounded-3 w-100"
                style={{ maxHeight: "80vh", objectFit: "contain" }}
              />
            </div>
          </div>
        </>
      )}

      {/* 5. Property Floors List Header */}
      <h5 className="fw-bold mb-3" style={{ fontSize: "1.1rem", color: "#0f172a" }}>
        Property Floors ({floors.length})
      </h5>

      {/* Floor Items List */}
      <div className="d-flex flex-column gap-3 mb-4">
        {floors.map((floor: any, idx: number) => {
          const isOccupied = floor.occupancyStatus === "Occupied" || (floor.occupants && floor.occupants.length > 0) || floor.isOccupied;
          const isPartially = floor.occupancyStatus === "Partially Occupied";
          const statusLabel = floor.occupancyStatus || (isOccupied ? "Occupied" : "Vacant");

          const primaryOccupant = floor.occupants && floor.occupants.length > 0 ? floor.occupants[0] : null;
          const occupantDisplayName = floor.occupiedBy && floor.occupiedBy !== "Vacant"
            ? floor.occupiedBy
            : primaryOccupant ? (primaryOccupant.companyName || primaryOccupant.tenantName) : "Vacant";

          return (
            <div
              key={floor._id || idx}
              className="bg-white border rounded-3 p-3 p-md-3.5 shadow-sm"
              style={{ borderColor: "#e2e8f0" }}
            >
              {/* Floor Header Line */}
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                    style={{ width: "34px", height: "34px", backgroundColor: "#ffedd5", color: "#ea580c" }}
                  >
                    <i className="bi bi-layers-fill" style={{ fontSize: "1rem" }}></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0" style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                      {floor.floorNumber} – {floor.floorName}
                    </h6>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      Occupant: {occupantDisplayName}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-semibold"
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor: isOccupied ? "#dcfce7" : isPartially ? "#fef9c3" : "#ffedd5",
                    color: isOccupied ? "#15803d" : isPartially ? "#854d0e" : "#ea580c"
                  }}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Floor Metrics Line */}
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 text-muted pt-1 mb-1" style={{ fontSize: "0.82rem" }}>
                <div>
                  <span className="me-3">Total: <strong className="text-dark">{floor.totalSft?.toLocaleString() || 1000} sft</strong></span>
                  <span>Occ: <strong className="text-dark">{floor.occupiedSft?.toLocaleString() || 0} sft</strong></span>
                </div>
                <div className="fw-bold" style={{ color: floor.floorRevenue > 0 ? "#16a34a" : "#64748b", fontSize: "0.85rem" }}>
                  Rev: ₹{(floor.floorRevenue || 0).toLocaleString()}
                </div>
              </div>

              {/* Occupant Details Card Box */}
              {primaryOccupant && (
                <div
                  className="rounded-3 p-3 mt-2.5"
                  style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1.5">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-building text-success" style={{ fontSize: "0.95rem" }}></i>
                      <span className="fw-bold text-success-emphasis" style={{ fontSize: "0.88rem" }}>
                        {primaryOccupant.companyName || primaryOccupant.tenantName}
                        {primaryOccupant.tenantName && primaryOccupant.companyName && primaryOccupant.tenantName !== primaryOccupant.companyName ? ` (${primaryOccupant.tenantName})` : ""}
                      </span>
                    </div>
                    <span
                      className="badge rounded-pill fw-semibold px-2.5 py-1"
                      style={{ backgroundColor: "#15803d", color: "#ffffff", fontSize: "0.7rem" }}
                    >
                      {primaryOccupant.tenantType || "Corporate"}
                    </span>
                  </div>

                  {primaryOccupant.tenantContact && (
                    <div className="d-flex align-items-center gap-2 text-muted mb-2" style={{ fontSize: "0.82rem" }}>
                      <i className="bi bi-telephone" style={{ fontSize: "0.8rem" }}></i>
                      <span>{primaryOccupant.tenantContact}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-1 border-top" style={{ borderColor: "#dcfce7", fontSize: "0.82rem" }}>
                    <div className="fw-bold text-success">
                      Rent: ₹{(primaryOccupant.monthlyRent || 0).toLocaleString()} / mo
                    </div>
                    <div className="text-muted">
                      Maint: ₹{(primaryOccupant.maintenanceCharges || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Admin Line */}
              {floor.assignedAdmin && (
                <div className="d-flex align-items-center gap-1.5 mt-2 text-warning-emphasis" style={{ fontSize: "0.82rem" }}>
                  <i className="bi bi-person-fill" style={{ color: "#ea580c" }}></i>
                  <span style={{ color: "#ea580c", fontWeight: 600 }}>
                    Admin: {floor.assignedAdmin.name || floor.assignedAdmin.email}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
