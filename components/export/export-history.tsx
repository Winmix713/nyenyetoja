"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Github, Calendar, Search, Trash2, RefreshCw } from "lucide-react"

interface ExportRecord {
  id: string
  componentName: string
  framework: string
  exportMethod: "zip" | "github"
  createdAt: string
  status: "success" | "failed" | "pending"
  githubUrl?: string
  downloadUrl?: string
  options: {
    styling: string
    typescript: boolean
    includeTests: boolean
  }
}

export function ExportHistory() {
  const [exports, setExports] = useState<ExportRecord[]>([])
  const [filteredExports, setFilteredExports] = useState<ExportRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFramework, setFilterFramework] = useState("all")
  const [filterMethod, setFilterMethod] = useState("all")

  // Mock data - in real app this would come from API/localStorage
  useEffect(() => {
    const mockExports: ExportRecord[] = [
      {
        id: "1",
        componentName: "LoginForm",
        framework: "react",
        exportMethod: "github",
        createdAt: "2024-01-15T10:30:00Z",
        status: "success",
        githubUrl: "https://github.com/user/loginform-component",
        options: {
          styling: "tailwind",
          typescript: true,
          includeTests: true,
        },
      },
      {
        id: "2",
        componentName: "ProductCard",
        framework: "next",
        exportMethod: "zip",
        createdAt: "2024-01-14T15:45:00Z",
        status: "success",
        downloadUrl: "/downloads/productcard-export.zip",
        options: {
          styling: "css",
          typescript: false,
          includeTests: false,
        },
      },
      {
        id: "3",
        componentName: "NavigationMenu",
        framework: "vite",
        exportMethod: "github",
        createdAt: "2024-01-13T09:15:00Z",
        status: "failed",
        options: {
          styling: "styled-components",
          typescript: true,
          includeTests: true,
        },
      },
    ]

    setExports(mockExports)
    setFilteredExports(mockExports)
  }, [])

  // Filter exports based on search and filters
  useEffect(() => {
    let filtered = exports

    if (searchTerm) {
      filtered = filtered.filter((exp) => exp.componentName.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filterFramework !== "all") {
      filtered = filtered.filter((exp) => exp.framework === filterFramework)
    }

    if (filterMethod !== "all") {
      filtered = filtered.filter((exp) => exp.exportMethod === filterMethod)
    }

    setFilteredExports(filtered)
  }, [exports, searchTerm, filterFramework, filterMethod])

  const handleReExport = async (exportRecord: ExportRecord) => {
    console.log("Re-exporting:", exportRecord)
    // Re-export logic would go here
  }

  const handleDelete = async (exportId: string) => {
    setExports(exports.filter((exp) => exp.id !== exportId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterFramework} onValueChange={setFilterFramework}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="next">Next.js</SelectItem>
                <SelectItem value="vite">Vite</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="zip">ZIP Download</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Export List */}
      <div className="space-y-4">
        {filteredExports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exports found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterFramework !== "all" || filterMethod !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by exporting your first component"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredExports.map((exportRecord) => (
            <Card key={exportRecord.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium">{exportRecord.componentName}</h3>
                      {getStatusBadge(exportRecord.status)}
                      <Badge variant="outline">{exportRecord.framework}</Badge>
                      <Badge variant="outline">
                        {exportRecord.exportMethod === "github" ? (
                          <>
                            <Github className="w-3 h-3 mr-1" />
                            GitHub
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3 mr-1" />
                            ZIP
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Exported: {formatDate(exportRecord.createdAt)}</p>
                      <p>
                        Options: {exportRecord.options.styling}
                        {exportRecord.options.typescript && ", TypeScript"}
                        {exportRecord.options.includeTests && ", Tests"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {exportRecord.status === "success" && exportRecord.githubUrl && (
                      <Button variant="outline" size="sm" onClick={() => window.open(exportRecord.githubUrl, "_blank")}>
                        <Github className="w-4 h-4 mr-2" />
                        View Repo
                      </Button>
                    )}

                    {exportRecord.status === "success" && exportRecord.downloadUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(exportRecord.downloadUrl, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={() => handleReExport(exportRecord)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-export
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(exportRecord.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      {exports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{exports.length}</div>
                <div className="text-sm text-gray-600">Total Exports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {exports.filter((e) => e.status === "success").length}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {exports.filter((e) => e.exportMethod === "github").length}
                </div>
                <div className="text-sm text-gray-600">GitHub Repos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {exports.filter((e) => e.exportMethod === "zip").length}
                </div>
                <div className="text-sm text-gray-600">ZIP Downloads</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
