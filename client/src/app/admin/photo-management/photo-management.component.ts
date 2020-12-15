import { Component, OnInit } from '@angular/core';
import { Photo } from 'src/app/_models/photo';
import { AdminService } from 'src/app/_services/admin.service';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.css']
})
export class PhotoManagementComponent implements OnInit {
  photos: Photo[];

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.getPhotosForApproval();
  }

  getPhotosForApproval() {
    this.adminService.getPhotosForApproval().subscribe(photos => {
      this.photos = photos;
    })
  }

  approvePhoto(photoId: number) {
    this.adminService.approvePhoto(photoId).subscribe(() => {
      this.photos = this.photos.filter(p => p.id !== photoId);
    })
  }

  rejectPhoto(photoId: number) {
    this.adminService.rejectPhoto(photoId).subscribe(() => {
      this.photos = this.photos.filter(p => p.id != photoId);
    })
  }

}
