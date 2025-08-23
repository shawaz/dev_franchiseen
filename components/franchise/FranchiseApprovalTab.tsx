"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building,
  DollarSign,
  User,
  Calendar,
  Eye,
  AlertTriangle,
  Map,
  List,
  Plus,
  Minus
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useGillFranchiseToken } from '@/hooks/useGillFranchiseToken';

interface Business {
  _id: Id<"businesses">;
  name: string;
  slug?: string;
  logoUrl?: string;
}

interface PendingFranchise {
  _id: Id<"franchise">;
  businessId: Id<"businesses">;
  owner_id: Id<"users">;
  locationAddress: string;
  building: string;
  carpetArea: number;
  costPerArea: number;
  totalInvestment: number;
  totalShares: number;
  selectedShares: number;
  createdAt: number;
  status: string;
  slug?: string;
  proposalDetails?: {
    businessPlan: string;
    experience: string;
    financialCapacity: number;
    expectedROI: number;
  };
}

interface FranchiseApprovalTabProps {
  business: Business;
}

export default function FranchiseApprovalTab({ business }: FranchiseApprovalTabProps) {
  const { formatAmount } = useGlobalCurrency();
  const [selectedFranchise, setSelectedFranchise] = useState<PendingFranchise | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'requests' | 'map'>('requests');
  const [restrictedAreas, setRestrictedAreas] = useState<any[]>([]);
  const [mapRef, setMapRef] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>(null);
  
  // Get Gill franchise token hook
  const { createFranchiseToken, connected } = useGillFranchiseToken();
  
  // Get pending franchise proposals
  const pendingFranchises = useQuery(api.franchise.getPendingByBusiness, {
    businessId: business._id
  }) || [];

  // Mutations for approval/rejection
  const approveFranchise = useMutation(api.franchise.approveFranchise);
  const rejectFranchise = useMutation(api.franchise.rejectFranchise);

  const handleApprove = async (franchise: PendingFranchise) => {
    if (!connected) {
      toast.error('Please connect your wallet to approve franchises');
      return;
    }

    setLoading(franchise._id);
    try {
      // 1. Create franchise token on Solana
      const tokenResult = await createFranchiseToken(
        franchise.slug || franchise._id,
        franchise.totalShares,
        franchise.costPerArea
      );

      // 2. Update franchise status in database
      await approveFranchise({
        franchiseId: franchise._id,
        tokenMint: tokenResult.tokenMint.toString(),
        transactionSignature: tokenResult.signature
      });

      toast.success('Franchise approved and token created successfully!');
    } catch (error) {
      console.error('Error approving franchise:', error);
      toast.error('Failed to approve franchise');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (franchise: PendingFranchise, reason: string) => {
    setLoading(franchise._id);
    try {
      await rejectFranchise({
        franchiseId: franchise._id,
        rejectionReason: reason
      });

      toast.success('Franchise proposal rejected. Funds will be returned to the proposer.');
    } catch (error) {
      console.error('Error rejecting franchise:', error);
      toast.error('Failed to reject franchise');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Approval":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "Under Review":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>;
      case "Approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "Rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Initialize Google Maps for area management
  const initializeMap = () => {
    if (!mapRef || !window.google) return;

    const defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai default

    const mapInstance = new window.google.maps.Map(mapRef, {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(mapInstance);

    // Add drawing manager for area restrictions
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['circle', 'polygon']
      },
      circleOptions: {
        fillColor: '#ff0000',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#ff0000',
        clickable: true,
        editable: true,
        zIndex: 1
      },
      polygonOptions: {
        fillColor: '#ff0000',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#ff0000',
        clickable: true,
        editable: true,
        zIndex: 1
      }
    });

    drawingManager.setMap(mapInstance);

    // Handle area creation
    drawingManager.addListener('overlaycomplete', (event: any) => {
      const newArea = {
        id: Date.now(),
        type: event.type,
        overlay: event.overlay,
        restricted: true
      };
      setRestrictedAreas(prev => [...prev, newArea]);
    });
  };

  const toggleAreaRestriction = (areaId: number) => {
    setRestrictedAreas(prev =>
      prev.map(area =>
        area.id === areaId
          ? { ...area, restricted: !area.restricted }
          : area
      )
    );
  };

  const removeArea = (areaId: number) => {
    setRestrictedAreas(prev => {
      const area = prev.find(a => a.id === areaId);
      if (area && area.overlay) {
        area.overlay.setMap(null);
      }
      return prev.filter(a => a.id !== areaId);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Franchise Approvals</h2>
          <p className="text-stone-600 dark:text-stone-400">
            Review and approve franchise proposals for {business.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'requests' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('requests')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Requests
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setViewMode('map');
                setTimeout(() => initializeMap(), 100);
              }}
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              Map View
            </Button>
          </div>

          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {pendingFranchises.filter(f => f.status === "Pending Approval").length} Pending
          </Badge>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Territory Management</h3>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full opacity-60"></div>
                  <span>Available Areas</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full opacity-60"></div>
                  <span>Restricted Areas</span>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="h-96 bg-gray-100 dark:bg-stone-800 rounded-lg relative">
              <div
                ref={setMapRef}
                className="w-full h-full rounded-lg"
              />

              {!map && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Area Management Controls */}
            {restrictedAreas.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Restricted Areas</h4>
                <div className="space-y-2">
                  {restrictedAreas.map((area) => (
                    <div key={area.id} className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-800 rounded">
                      <span className="text-sm">
                        {area.type === 'circle' ? 'Circular Area' : 'Polygon Area'} #{area.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={area.restricted ? "destructive" : "outline"}
                          onClick={() => toggleAreaRestriction(area.id)}
                        >
                          {area.restricted ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          {area.restricted ? 'Remove Restriction' : 'Add Restriction'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeArea(area.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Requests View */}
      {viewMode === 'requests' && (
        <>
          {/* Pending Proposals */}
          {pendingFranchises.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">No Pending Proposals</h3>
              <p className="text-stone-600 dark:text-stone-400">
                All franchise proposals have been reviewed. New proposals will appear here.
              </p>
            </Card>
          ) : (
        <div className="grid gap-6">
          {pendingFranchises.map((franchise) => (
            <Card key={franchise._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Building className="w-8 h-8 text-blue-600 bg-blue-100 p-1.5 rounded" />
                  <div>
                    <h3 className="text-lg font-semibold">{franchise.building}</h3>
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                      <MapPin className="w-4 h-4" />
                      {franchise.locationAddress}
                    </div>
                  </div>
                </div>
                {getStatusBadge(franchise.status)}
              </div>

              {/* Proposal Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="text-sm text-stone-600 dark:text-stone-400">Investment Details</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Investment:</span>
                      <span className="font-semibold">{formatAmount(franchise.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Area:</span>
                      <span className="font-semibold">{franchise.carpetArea} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cost per sq ft:</span>
                      <span className="font-semibold">{formatAmount(franchise.costPerArea)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-stone-600 dark:text-stone-400">Share Structure</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Shares:</span>
                      <span className="font-semibold">{franchise.totalShares.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Initial Shares:</span>
                      <span className="font-semibold">{franchise.selectedShares.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Share Price:</span>
                      <span className="font-semibold">{formatAmount(franchise.totalInvestment / franchise.totalShares)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-stone-600 dark:text-stone-400">Timeline</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted: {new Date(franchise.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      <span>Proposer ID: {franchise.owner_id.slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {franchise.status === "Pending Approval" && (
                <div className="flex items-center gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
                  <Button
                    onClick={() => handleApprove(franchise)}
                    disabled={loading === franchise._id || !connected}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading === franchise._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Token...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Create Token
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => handleReject(franchise, "Proposal does not meet requirements")}
                    disabled={loading === franchise._id}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Proposal
                  </Button>

                  <Button
                    onClick={() => setSelectedFranchise(franchise)}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              )}

              {!connected && franchise.status === "Pending Approval" && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Connect your wallet to approve franchises and create tokens
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
          )}
        </>
      )}
    </div>
  );
}
