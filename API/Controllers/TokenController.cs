using System;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class TokenController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUnitOfWork _unitOfWork;
        public TokenController(UserManager<AppUser> userManager, ITokenService tokenService, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _userManager = userManager;
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<UserDto>> Refresh(TokenDto tokenDto)
        {
            if (tokenDto is null)
            {
                return BadRequest("Invalid client request");
            }

            string accessToken = tokenDto.AccessToken;
            string refreshToken = tokenDto.RefreshToken;

            var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
            var username = principal.Identity.Name;

            var user = await _userManager.Users.SingleOrDefaultAsync(u => u.UserName == username);

            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return BadRequest("Invalid client request");
            }

            var newAccessToken = await _tokenService.CreateAccessToken(user);
            var newRefreshToken = _tokenService.CreateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            
            if (await _unitOfWork.Complete())
            {
                return Ok(new TokenDto 
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken
                });
            }

            return BadRequest("Unable to generate new tokens");
        }

        [HttpPost("revoke"), Authorize]
        public async Task<IActionResult> Revoke()
        {
            var username = User.GetUsername();

            var user = await _userManager.Users.SingleOrDefaultAsync(u => u.UserName == username);

            if (user == null) return BadRequest();

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = DateTime.MinValue;

            if (await _unitOfWork.Complete()) return NoContent();

            return BadRequest();
        }
    }
}