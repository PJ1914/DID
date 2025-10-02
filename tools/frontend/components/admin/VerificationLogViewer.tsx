'use client';

import { useState, useMemo } from 'react';
import { useVerificationLogger } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Search, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export function VerificationLogViewer() {
    const { logs, recentLogs, logCount } = useVerificationLogger();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Combine and deduplicate logs
    const allLogs = useMemo(() => {
        const combined = [...(logs || []), ...recentLogs];
        const unique = combined.filter((log, index, self) =>
            index === self.findIndex(l =>
                l.user === log.user &&
                l.timestamp === log.timestamp &&
                l.verificationType === log.verificationType
            )
        );
        return unique.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    }, [logs, recentLogs]);

    // Filter logs
    const filteredLogs = useMemo(() => {
        return allLogs.filter(log => {
            const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.verificationType.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || log.verificationType === filterType;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'success' ? log.success : !log.success);
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [allLogs, searchTerm, filterType, filterStatus]);

    // Get unique verification types
    const verificationTypes = useMemo(() => {
        return Array.from(new Set(allLogs.map(log => log.verificationType)));
    }, [allLogs]);

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['User', 'Type', 'Status', 'Timestamp', 'Block Number'];
        const rows = filteredLogs.map(log => [
            log.user,
            log.verificationType,
            log.success ? 'Success' : 'Failed',
            new Date(Number(log.timestamp) * 1000).toISOString(),
            log.blockNumber.toString(),
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-logs-${Date.now()}.csv`;
        a.click();
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Verification Logs</CardTitle>
                        <CardDescription>
                            Real-time verification attempts from all users ({logCount?.toString() || '0'} total)
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={exportToCSV} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by address or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Verification Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {verificationTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{filteredLogs.length}</div>
                            <p className="text-xs text-muted-foreground">Total Logs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">
                                {filteredLogs.filter(log => log.success).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Successful</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">
                                {filteredLogs.filter(log => !log.success).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Failed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Block</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No verification logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <TableRow key={`${log.user}-${log.timestamp}-${index}`}>
                                        <TableCell className="font-mono text-xs">
                                            {log.user.slice(0, 6)}...{log.user.slice(-4)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.verificationType}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {log.success ? (
                                                <Badge variant="default" className="bg-green-500">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Success
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    Failed
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatDistanceToNow(new Date(Number(log.timestamp) * 1000), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {log.blockNumber.toString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
